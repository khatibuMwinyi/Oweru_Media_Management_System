import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#020617] text-slate-300 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand + Description */}
        <div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Oweru Media Hub
          </h3>
          <p className="mt-3 text-sm text-slate-400">
            Smart, secure real estate powered by technology. Helping you make
            smarter property decisions with transparency and trust.
          </p>

          {/* Social icons */}
          <div className="flex gap-4 mt-6">
            <SocialIcon icon={<Facebook />} />
            <SocialIcon icon={<Twitter />} />
            <SocialIcon icon={<Instagram />} />
            <SocialIcon icon={<Linkedin />} />
          </div>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Explore</h4>
          <FooterLink href="#about">About Us</FooterLink>
          <FooterLink href="#contact">Contact</FooterLink>
          <FooterLink href="#terms">Terms</FooterLink>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">
            Contact Info
          </h4>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-slate-400" />
            <p className="text-sm">
              Tancot House Posta-Dar es Salaam, Tanzania
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Phone className="w-5 h-5 text-slate-400" />
            <p className="text-sm">+255 714 859 934</p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Mail className="w-5 h-5 text-slate-400" />
            <p className="text-sm">info@oweru.com</p>
          </div>
        </div>

        {/* Newsletter (optional) */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">
            Stay Updated
          </h4>
          <p className="text-sm text-slate-400">
            Subscribe to receive the latest real estate updates.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-3 py-2 rounded-md bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 focus:outline-none"
            />
            <button className="bg-blue-700 hover:bg-blue-600 text-white px-4 rounded-md">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 mt-12 pt-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Oweru Media Hub. All rights reserved.
      </div>
    </footer>
  );
}

function FooterLink({ href, children }) {
  return (
    <a
      href={href}
      className="block text-sm text-slate-300 hover:text-white mb-2 transition"
    >
      {children}
    </a>
  );
}

function SocialIcon({ icon }) {
  return (
    <div className="w-9 h-9 flex items-center justify-center bg-[#0f172a] hover:bg-blue-700 transition text-white rounded-full">
      {icon}
    </div>
  );
}
