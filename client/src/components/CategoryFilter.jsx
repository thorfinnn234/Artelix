const categories = [
  "All", "Plumber", "Electrician", "Carpenter", "Painter",
  "Welder", "Mason / Bricklayer", "Cleaner", "Mechanic",
  "Generator Repair", "AC Technician", "Tiler", "Roofer",
  "Interior Decorator", "Fumigator", "Security Guard", "Driver",
  "Dispatch Rider", "Barber", "Hair Stylist", "Makeup Artist",
  "Tailor / Fashion Designer", "Laundry / Dry Cleaner",
  "Photographer", "Videographer", "Event Planner", "Caterer / Chef",
  "Nanny / Babysitter", "Personal Trainer", "Tutor / Teacher",
  "Vulcanizer", "Web Developer", "Mobile App Developer",
  "UI/UX Designer", "Graphic Designer", "Content Writer",
  "Copywriter", "Social Media Manager", "Digital Marketer",
  "SEO Specialist", "Video Editor", "Motion Graphics",
  "Data Analyst", "Virtual Assistant", "Customer Support",
  "Voiceover Artist", "Translator", "Accountant / Bookkeeper",
  "Business Consultant", "Cybersecurity Analyst", "E-commerce Manager",
];

export default function CategoryFilter({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input"
    >
      {categories.map((cat) => (
        <option key={cat} value={cat === "All" ? "" : cat}>
          {cat}
        </option>
      ))}
    </select>
  );
}