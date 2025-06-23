import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Facebook,
  Shield,
  FileText,
  Database,
  Zap,
  ArrowRight,
  Check,
  Star,
  Users,
  Headphones
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModernHomepage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 3);
    }, 3000);
    document.body.classList.add('home-page');
    return () => {
      clearInterval(interval);
      document.body.classList.remove('home-page');
    };
  }, []);

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Authentication",
      description: "Advanced OTP and email verification with enterprise-grade security protocols.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Smart Invoice Management",
      description: "AI-powered invoice processing with automated tracking and smart categorization.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Unified Database",
      description: "Centralized data management with real-time synchronization across platforms.",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const stats = [
    { value: "5000+", label: "Active Users", icon: <Users className="w-6 h-6" /> },
    { value: "98%", label: "Satisfaction Rate", icon: <Star className="w-6 h-6" /> },
    { value: "24/7", label: "Support", icon: <Headphones className="w-6 h-6" /> },
    { value: "99.9%", label: "Uptime", icon: <Zap className="w-6 h-6" /> }
  ];

  const benefits = [
    "Create professional invoices in minutes",
    "Real-time payment tracking & analytics",
    "Automated payment reminders & follow-ups",
    "Multi-currency support with live rates",
    "Advanced reporting & business insights",
    "Seamless integrations with 100+ apps"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                BillFlow
              </span>
            </div>
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 text-blue-700 hover:text-white hover:bg-blue-500 rounded-lg transition-colors duration-200"
                onClick={() => navigate('/auth')}
              >
                Login
              </button>
              <button
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow"
                onClick={() => navigate('/auth')}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Invoice Management <br /> Reimagined
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience the future of billing with our AI-powered platform. Streamline your workflow, automate tedious tasks, and focus on growing your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-semibold">
              Start Free Trial
            </button>
            <button className="px-8 py-4 border border-blue-200 text-blue-700 bg-white rounded-xl shadow hover:bg-blue-50 transition">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-blue-700">
            Powerful Features for Modern Businesses
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto text-center mb-12">
            Everything you need to manage your billing, all in one place
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`p-8 rounded-2xl bg-gray-50 border border-gray-200 shadow hover:shadow-xl transition ${
                  activeFeature === index ? 'ring-2 ring-blue-400' : ''
                }`}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-2 text-blue-700">
                  {stat.value}
                </div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-700">
                Why Choose BillFlow?
              </h2>
              <p className="text-gray-500 text-lg mb-8">
                Join thousands of businesses that trust BillFlow for their billing needs
              </p>
              <div className="space-y-4 mt-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500">
                      <Check className="w-5 h-5 text-white" />
                    </span>
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl border border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-blue-700">Smart Dashboard</h3>
                  <p className="text-gray-500">Manage everything from one place</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-700">About NOVAMIND INSIGHTS PRIVATE LIMITED</h2>
          <p className="text-gray-600 text-lg max-w-4xl mx-auto leading-relaxed">
          NOVAMIND INSIGHTS PRIVATE LIMITED is a pioneering force in educational technology, specializing in AI and ML 
            solutions that transform learning experiences. Our innovative billing platform represents 
            our commitment to simplifying complex processes through intelligent automation and 
            cutting-edge technology.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-cyan-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-700">Get In Touch</h2>
            <p className="text-gray-500 text-lg">We'd love to hear from you</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-blue-700">Email</h3>
              <p className="text-gray-600">mahadhyutaedtech@gmail.com</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-blue-700">Phone</h3>
              <p className="text-gray-600">+91 9452801761</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-blue-700">Location</h3>
              <p className="text-gray-600">Bhubaneswar, Odisha<br />India - 751015</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-blue-700">BillFlow</span>
              </div>
              <p className="text-gray-500">
                Your complete invoice management solution for modern businesses.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-700">Quick Links</h4>
              <ul className="space-y-2">
                {['Login', 'Sign Up', 'Features', 'About Us'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-500 hover:text-blue-700 transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-700">Legal</h4>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-500 hover:text-blue-700 transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-700">Follow Us</h4>
              <div className="flex space-x-4">
                {[
                  { icon: <Twitter className="w-5 h-5" />, href: "#" },
                  { icon: <Linkedin className="w-5 h-5" />, href: "#" },
                  { icon: <Facebook className="w-5 h-5" />, href: "#" }
                ].map((social, index) => (
                  <a 
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors duration-200"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} NOVAMIND INSIGHTS PRIVATE LIMITED. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernHomepage;