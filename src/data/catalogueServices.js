import {
  MapPin,
  Home,
  Phone,
  Mail,
  Globe,
  Building2,
  LineChart,
  Wrench,
  Landmark,
} from "lucide-react";

export const catalogueServices = [
  {
    title: "Lands & Plots",
    description:
      "Verified and legally documented lands and plots for residential, commercial, and investment purposes.",
    icon: MapPin,
  },
  {
    title: "Rentals",
    description:
      "Affordable, secure, and professionally managed rental properties designed for comfort and convenience.",
    icon: Home,
  },
  {
    title: "Property Sales",
    description:
      "Quality residential and commercial properties with transparent ownership and smooth transfer processes.",
    icon: Building2,
  },
  {
    title: "Investment",
    description:
      "Secure real estate investment opportunities delivering long-term value and sustainable returns.",
    icon: LineChart,
  },
  {
    title: "Construction & Management",
    description:
      "End-to-end construction services and professional property management solutions.",
    icon: Wrench,
  },
  {
    title: "Property Services",
    description:
      "Property valuation, consultancy, documentation, and advisory services handled by industry experts.",
    icon: Landmark,
  },
];

export const contactInfo = [
  {
    title: "Office Address",
    icon: MapPin,
    info: "Kibada Garden, Kibada, Kigamboni, Dar es Salaam, Tanzania",
  },
  {
    title: "Call Us",
    icon: Phone,
    info: "+255 711 890 764",
  },
  {
    title: "Email",
    icon: Mail,
    info: "info@oweruinternational.com",
  },
  {
    title: "Website",
    icon: Globe,
    info: "www.oweruinternational.com",
    link: "https://www.oweruinternational.com",
  },
];
