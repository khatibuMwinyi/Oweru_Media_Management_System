import { MapPin, Phone, Mail } from "lucide-react";

export default function GetInTouch() {
  return (
    <section className="bg-[#020617] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Get In Touch
          </h2>
          <p className="mt-3 text-sm uppercase tracking-widest text-slate-300">
            We’d love to hear from you
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* FORM */}
          <div className="bg-[#0f172a] rounded-xl p-8 border border-slate-800">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="First Name" />
                <Input label="Last Name" />
              </div>

              <Input label="Email" />
              <Input label="Subject" />

              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                  Message
                </label>
                <textarea
                  rows="5"
                  className="w-full bg-transparent border border-slate-700 rounded-md px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <button className="w-full bg-blue-700 hover:bg-blue-600 transition text-white font-semibold py-3 rounded-md uppercase tracking-widest">
                Send Message
              </button>
            </form>
          </div>

          {/* INFO */}
          <div className="bg-[#0f172a] rounded-xl p-8 border border-slate-800 space-y-10">
            <Info
              icon={<MapPin />}
              title="Visit Our Office"
              lines={["123 Business Avenue", "Dar es Salaam, Tanzania"]}
            />

            <Info
              icon={<Phone />}
              title="Call Us"
              lines={["+255 700 000 000", "Mon–Fri, 9AM–6PM"]}
            />

            <Info
              icon={<Mail />}
              title="Email Us"
              lines={["info@oweru.com", "support@oweru.com"]}
              highlight
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Components ---------- */

function Input({ label }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
        {label}
      </label>
      <input className="w-full bg-transparent border border-slate-700 rounded-md px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-600" />
    </div>
  );
}

function Info({ icon, title, lines, highlight }) {
  return (
    <div className="flex gap-4">
      <div className="w-11 h-11 rounded-md bg-blue-700 flex items-center justify-center text-white">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-semibold uppercase tracking-widest text-white mb-2">
          {title}
        </h4>
        {lines.map((line, i) => (
          <p
            key={i}
            className={
              highlight ? "text-blue-400 text-sm" : "text-slate-300 text-sm"
            }
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
