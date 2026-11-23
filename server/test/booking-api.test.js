import { removeBookingPhotos } from "../src/services/bookingPhotos.js";
﻿import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import Artisan from "../src/models/artisan.js";
import Booking from "../src/models/booking.js";
import Notification from "../src/models/notification.js";
import bookingRoutes from "../src/routes/booking.routes.js";

// Exercise the real router, JWT middleware, controllers and validators against
// isolated in-memory model adapters; no live database or credentials are used.
test("booking API permissions, lifecycle, notifications, reviews, disputes and stale writes", async t => {
  const ids = { customer: "111111111111111111111111", artisan: "222222222222222222222222", admin: "333333333333333333333333", listing: "444444444444444444444444", stranger: "555555555555555555555555" };
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const users = new Map([
    [ids.customer, { _id: ids.customer, role: "user", fullName: "Customer", isSuspended: false }],
    [ids.artisan, { _id: ids.artisan, role: "artisan", fullName: "Artisan", isSuspended: false }],
    [ids.admin, { _id: ids.admin, role: "admin", fullName: "Administrator", isSuspended: false }],
    [ids.stranger, { _id: ids.stranger, role: "user", fullName: "Unrelated customer", isSuspended: false }],
  ]);
  const listing = { _id: ids.listing, ownerId: ids.artisan, name: "Test plumbing", status: "approved", category: "Plumber" };
  const records = new Map(), notifications = [];
  const path = (obj, key) => key.split('.').reduce((v,k) => v?.[k], obj);
  const matches = (record, filter) => Object.entries(filter).every(([key,value]) => {
    const actual = path(record,key);
    if (value && typeof value === 'object' && '$in' in value) return value.$in.includes(actual);
    if (value && typeof value === 'object' && '$lte' in value) return actual != null && new Date(actual) <= new Date(value.$lte);
    if (value && typeof value === 'object' && '$exists' in value) return (actual !== undefined) === value.$exists;
    if (value == null) return actual == null;
    return String(actual) === String(value);
  });
  const apply = (record, change) => {
    Object.assign(record, clone(change.$set || {}));
    for (const [key,amount] of Object.entries(change.$inc || {})) record[key]=(record[key] || 0)+amount;
    for (const [key,value] of Object.entries(change.$push || {})) (record[key] ||= []).push({ _id: new mongoose.Types.ObjectId().toString(), ...clone(value) });
    record.updatedAt = new Date().toISOString();
    return clone(record);
  };
  class Query {
    constructor(fn) { this.fn=fn;this.populatePaths=[];this.exclusions=[];this.offset=0;this.max=Infinity; }
    select(value) { this.exclusions=value.split(' ').filter(v=>v.startsWith('-')).map(v=>v.slice(1));return this; }
    populate(value) { this.populatePaths.push(value);return this; }
    sort() { return this; } skip(n) { this.offset=n;return this; } limit(n) { this.max=n;return this; }
    session() { return this; } lean() { return this; }
    then(resolve,reject) {
      return Promise.resolve().then(()=>{
        let result=clone(this.fn());
        const decorate=record=>{
          if(!record)return record;
          for(const key of this.exclusions)delete record[key];
          for(const key of this.populatePaths) {
            if(key==='artisanId')record[key]=clone(listing);
            else record[key]=clone(users.get(String(record[key])));
          }
          return record;
        };
        return Array.isArray(result)?result.slice(this.offset,this.offset+this.max).map(decorate):decorate(result);
      }).then(resolve,reject);
    }
  }
  t.mock.method(User,'findById',id=>new Query(()=>users.get(String(id))));
  t.mock.method(Artisan,'findById',id=>Promise.resolve(String(id)===ids.listing?clone(listing):null));
  t.mock.method(Artisan,'findByIdAndUpdate',async()=>listing);
  t.mock.method(Booking,'create',async data=>{
    const doc = new Booking(data); await doc.validate();
    const record={...clone(doc.toObject()),__v:0,createdAt:new Date().toISOString()};records.set(record._id,record);return clone(record);
  });
  t.mock.method(Booking,'findById',id=>new Query(()=>records.get(String(id))));
  t.mock.method(Booking,'find',filter=>new Query(()=>[...records.values()].filter(r=>matches(r,filter))));
  t.mock.method(Booking,'countDocuments',async filter=>[...records.values()].filter(r=>matches(r,filter)).length);
  t.mock.method(Booking,'updateMany',async (filter,update)=>{for(const r of records.values())if(matches(r,filter))apply(r,update);});
  t.mock.method(Booking,'findOneAndUpdate',async(filter,update)=>{const r=[...records.values()].find(r=>matches(r,filter));return r?apply(r,update):null;});
  t.mock.method(Notification,'create',async data=>{notifications.push(data);return data;});
  t.mock.method(User,'find',filter=>new Query(()=>[...users.values()].filter(u=>matches(u,filter))));
  // Public ratings are averaged from completed bookings that carry a review.
  t.mock.method(Booking,'aggregate',()=>new Query(()=>{const rated=[...records.values()].filter(r=>r.status==='completed'&&r.review);return rated.length?[{average:rated.reduce((sum,r)=>sum+r.review.rating,0)/rated.length}]:[];}));
  t.mock.method(mongoose,'startSession',async()=>({withTransaction:async fn=>fn(),endSession:async()=>{}}));
  const previousSecret=process.env.JWT_SECRET;
  process.env.JWT_SECRET='booking-tests-only-not-a-production-secret';
  t.after(()=>{if(previousSecret===undefined)delete process.env.JWT_SECRET;else process.env.JWT_SECRET=previousSecret;});
  const app=express();app.use(express.json());app.use('/api/bookings',bookingRoutes);
  app.use((error,req,res,next)=>res.status(error.statusCode || 500).json({message:error.message}));
  const server=app.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>new Promise(resolve=>server.close(resolve)));
  const url=`http://127.0.0.1:${server.address().port}/api/bookings`;
  async function request(who,method,path='',body) {
    const headers={};if(who)headers.Authorization='Bearer '+jwt.sign({sub:ids[who]},process.env.JWT_SECRET);
    if(body && !(body instanceof FormData))headers['Content-Type']='application/json';
    const response=await fetch(url+path,{method,headers,body:body instanceof FormData ? body : body?JSON.stringify(body):undefined});
    return {status:response.status,...await response.json()};
  }
  const payload={artisanId:ids.listing,title:'Repair kitchen pipe',description:'Repair the leaking kitchen pipe.',location:'Yaba, Lagos',preferredAt:new Date(Date.now()+86400000).toISOString(),budget:25000};
  assert.equal((await request(null,'GET')).status,401);
  assert.equal((await request('artisan','POST','',payload)).status,403);
  listing.status='suspended';assert.equal((await request('customer','POST','',payload)).status,403);listing.status='approved';
  users.get(ids.artisan).isSuspended=true;assert.equal((await request('customer','POST','',payload)).status,403);users.get(ids.artisan).isSuspended=false;
  assert.equal((await request('customer','POST','',{...payload,preferredAt:'2020-01-01'})).status,400);
  let result=await request('customer','POST','',payload);assert.equal(result.status,201);let b=result.booking;
  assert.equal(b.status,'requested');assert.equal(b.artisanId.name,listing.name);assert.equal(b.history.length,1);
  const bookingId=b._id;
  assert.equal((await request('stranger','GET',`/${bookingId}`)).status,403);
  assert.equal((await request('stranger','POST',`/${bookingId}/messages`,{body:'Intrusion'})).status,403);
  assert.equal((await request('stranger','GET',`/${bookingId}/photos/test.png`)).status,403);
  assert.equal((await request('stranger','GET')).bookings.length,0);
  assert.equal((await request('artisan','GET')).bookings.length,1);
  assert.equal((await request('admin','GET')).bookings.length,1);
  const terms={price:20000,scope:'Repair pipe and test it for leaks.',scheduledAt:new Date(Date.now()+2*86400000).toISOString()};
  async function action(who,name,extra={}) {
    const r=await request(who,'POST',`/${bookingId}/actions/${name}`,{version:b.__v,...extra});
    if(r.booking)b=r.booking;
    return r;
  }
  assert.equal((await action('customer','quote',terms)).status,403);
  assert.equal((await request('artisan','POST',`/${bookingId}/actions/quote`,terms)).status,400);
  const oldVersion=b.__v;
  assert.equal((await action('artisan','quote',terms)).status,200);assert.equal(b.status,'quoted');
  assert.equal((await request('customer','POST',`/${bookingId}/actions/confirm`,{version:oldVersion})).status,409);
  assert.equal((await request('customer','POST',`/${bookingId}/review`,{rating:5})).status,403);
  assert.equal((await action('customer','confirm')).status,200);assert.equal(b.status,'confirmed');
  assert.equal((await action('artisan','propose_change',{...terms,price:23000})).status,200);assert.equal(b.quote.price,20000);
  assert.equal((await action('artisan','accept_change')).status,409);
  assert.equal((await action('customer','accept_change')).status,200);assert.equal(b.quote.price,23000);
  users.get(ids.artisan).isSuspended=true;
  assert.equal((await action('artisan','start')).status,403);users.get(ids.artisan).isSuspended=false;
  assert.equal((await action('artisan','start')).status,200);assert.equal(b.status,'in_progress');
  assert.equal((await action('customer','cancel',{note:'I want to cancel.'})).status,409);
  assert.equal((await action('artisan','finish',{note:'Pipe repaired and pressure tested.'})).status,200);assert.equal(b.status,'awaiting_confirmation');
  assert.equal((await action('artisan','complete')).status,403);
  assert.equal((await action('customer','complete')).status,200);assert.equal(b.status,'completed');
  result=await request('customer','POST',`/${bookingId}/review`,{rating:5,comment:'Excellent work.'});assert.equal(result.status,200);assert.equal(result.booking.review.rating,5);
  assert.equal((await request('customer','POST',`/${bookingId}/review`,{rating:1})).status,409);
  result=await request('artisan','POST',`/${bookingId}/messages`,{body:'Thank you for booking!'});assert.equal(result.status,200);assert.equal(result.booking.messages[0].senderName,'Artisan');
  assert.ok(notifications.some(n=>String(n.userId)===ids.artisan && n.title==='New job request' && n.type==='booking'));
  assert.ok(notifications.some(n=>String(n.userId)===ids.customer && n.title==='Quote received'));
  assert.ok(notifications.some(n=>String(n.userId)===ids.artisan && n.title==='Booking approved'));
  assert.ok(notifications.some(n=>String(n.userId)===ids.customer && n.title==='Work marked finished'));
  assert.ok(notifications.some(n=>String(n.userId)===ids.artisan && n.type==='review' && n.message.includes('5/5')));
  assert.ok(notifications.some(n=>String(n.userId)===ids.customer && n.type==='message'));
  assert.ok(notifications.some(n=>n.link===`/user/bookings?booking=${bookingId}`));
  assert.ok(b.history.some(h=>h.action==='accept_change'));assert.equal(b.history.at(-1).action,'complete');
  // Expiry is applied server-side even if a client attempts to act on an old request.
  result=await request('customer','POST','',payload);const expiredId=result.booking._id;
  records.get(expiredId).expiresAt=new Date(Date.now()-1000).toISOString();
  result=await request('customer','GET',`/${expiredId}`);assert.equal(result.booking.status,'expired');assert.equal(result.booking.history.at(-1).action,'expire');
  // Administrator resolution is recorded and restricted to disputed jobs.
  const record=records.get(expiredId);record.status='confirmed';record.expiresAt=null;
  result=await request('customer','POST',`/${expiredId}/actions/dispute`,{version:record.__v,note:'The artisan did not attend.'});assert.equal(result.status,200);
  assert.ok(notifications.some(n=>String(n.userId)===ids.admin && n.title==='New booking dispute'));
  assert.ok(notifications.some(n=>String(n.userId)===ids.artisan && n.title==='Issue reported on booking' && n.message.includes('did not attend')));
  assert.equal((await request('artisan','POST',`/${expiredId}/actions/resolve`,{version:record.__v,note:'Please resolve it.',outcome:'cancelled'})).status,403);
  result=await request('admin','POST',`/${expiredId}/actions/resolve`,{version:record.__v,note:'Both parties agreed to cancel.',outcome:'cancelled'});assert.equal(result.status,200);assert.equal(result.booking.status,'cancelled');
  assert.equal(result.booking.history.at(-1).actorId,ids.admin);
  // Actual multipart upload and authorized photo retrieval use private storage.
  const form=new FormData();for(const [key,value] of Object.entries(payload))form.set(key,String(value));
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6S0sAAAAASUVORK5CYII=','base64');
  form.append('photos',new Blob([png],{type:'image/png'}),'project.png');
  result=await request('customer','POST','',form);assert.equal(result.status,201);assert.equal(result.booking.photos.length,1);
  const photoBooking=result.booking;const photoName=photoBooking.photos[0];
  t.after(()=>removeBookingPhotos(photoBooking.photos));
  const image=await fetch(url+'/'+photoBooking._id+'/photos/'+photoName,{headers:{Authorization:'Bearer '+jwt.sign({sub:ids.customer},process.env.JWT_SECRET)}});
  assert.equal(image.status,200);assert.ok(image.headers.get('content-type').includes('image/png'));assert.equal(image.headers.get('cache-control'),'private, no-store');
  assert.deepEqual(Buffer.from(await image.arrayBuffer()),png);
  assert.equal((await request('stranger','GET','/'+photoBooking._id+'/photos/'+photoName)).status,403);
  assert.equal((await request('customer','GET','/'+photoBooking._id+'/photos/unknown.png')).status,404);
  const invalid=new FormData();for(const [key,value] of Object.entries(payload))invalid.set(key,String(value));
  invalid.append('photos',new Blob(['<svg onload="alert(1)"></svg>'],{type:'image/png'}),'spoof.png');
  assert.equal((await request('customer','POST','',invalid)).status,400);
  assert.equal((await request('customer','GET','/bad-id')).status,400);
  assert.equal((await request('customer','GET','?status=unknown')).status,400);
});
