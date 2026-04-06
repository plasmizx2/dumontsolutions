import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">
                Build Your Online Presence
              </h1>
              <p className="text-xl text-gray-100 mb-8">
                Professional web development services tailored to your business.
                From design to deployment, we've got you covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/pricing"
                  className="px-8 py-3 bg-white text-primary-600 font-semibold rounded hover:bg-gray-100 transition text-center"
                >
                  View Pricing
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-3 border-2 border-white text-white font-semibold rounded hover:bg-primary-700 transition text-center"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="h-32 bg-white bg-opacity-20 rounded"></div>
                  <div className="h-20 bg-white bg-opacity-20 rounded"></div>
                  <div className="h-20 bg-white bg-opacity-20 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-lg flex items-center justify-center mb-4 text-xl">
                ✓
              </div>
              <h3 className="text-xl font-bold mb-3">Modern Design</h3>
              <p className="text-gray-600">
                Beautiful, responsive designs that work on all devices and
                captivate your audience.
              </p>
            </div>
            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-lg flex items-center justify-center mb-4 text-xl">
                ✓
              </div>
              <h3 className="text-xl font-bold mb-3">Expert Development</h3>
              <p className="text-gray-600">
                Clean, maintainable code built with the latest technologies and
                best practices.
              </p>
            </div>
            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-lg flex items-center justify-center mb-4 text-xl">
                ✓
              </div>
              <h3 className="text-xl font-bold mb-3">Ongoing Support</h3>
              <p className="text-gray-600">
                Keep your site secure and up-to-date with our maintenance
                packages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose a plan that fits your needs and launch your online presence today.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-8 py-3 bg-primary-600 text-white font-semibold rounded hover:bg-primary-700 transition"
          >
            View Pricing Plans
          </Link>
        </div>
      </section>
    </div>
  );
}
