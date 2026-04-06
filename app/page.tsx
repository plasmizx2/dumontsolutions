import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary-400/25 blur-3xl animate-float" />
          <div className="absolute -top-10 right-[-120px] h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl animate-float-slow" />
          <div className="absolute bottom-[-180px] left-[-180px] h-[520px] w-[520px] rounded-full bg-emerald-400/15 blur-3xl animate-float" />
        </div>

        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">
                <span className="inline-block h-2 w-2 rounded-full bg-primary-500 animate-shimmer" />
                Fast builds. Clean design. Real results.
              </p>
              <h1 className="mt-6 text-5xl sm:text-6xl font-black tracking-tight text-slate-900">
                Build a site people{" "}
                <span className="bg-gradient-to-r from-primary-700 via-primary-500 to-blue-600 bg-clip-text text-transparent">
                  actually enjoy
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-slate-600">
                Professional web development tailored to your business. From design to
                deployment, we build modern, high-converting experiences.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/pricing"
                  className="btn-primary text-center"
                >
                  View Pricing
                </Link>
                <Link
                  href="/contact"
                  className="btn-secondary text-center"
                >
                  Get in Touch
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  Mobile-first
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  SEO-ready
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  Easy to maintain
                </span>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="card card-hover p-6">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-32 rounded-lg bg-slate-900/90" />
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="h-40 rounded-xl bg-gradient-to-br from-primary-50 via-white to-blue-50 border border-slate-200/70" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-20 rounded-xl bg-white border border-slate-200/70 shadow-sm" />
                    <div className="h-20 rounded-xl bg-white border border-slate-200/70 shadow-sm" />
                    <div className="h-20 rounded-xl bg-white border border-slate-200/70 shadow-sm" />
                  </div>
                  <div className="h-12 rounded-xl bg-slate-900/95 shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-page">
          <h2 className="text-4xl font-black tracking-tight text-center mb-4">
            Why Choose Us
          </h2>
          <p className="text-center text-slate-600 max-w-2xl mx-auto mb-16">
            A polished look is table stakes. We pair great design with fast performance and
            clean engineering so your site feels premium.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card card-hover p-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-xl text-white shadow-[0_10px_30px_rgba(2,132,199,0.28)]"
                   style={{ background: "linear-gradient(135deg,#0284c7,#0ea5e9,#2563eb)" }}>
                ✓
              </div>
              <h3 className="text-xl font-bold mb-3">Modern Design</h3>
              <p className="text-gray-600">
                Beautiful, responsive designs that work on all devices and
                captivate your audience.
              </p>
            </div>
            <div className="card card-hover p-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-xl text-white shadow-[0_10px_30px_rgba(2,132,199,0.28)]"
                   style={{ background: "linear-gradient(135deg,#0ea5e9,#38bdf8,#22c55e)" }}>
                ✓
              </div>
              <h3 className="text-xl font-bold mb-3">Expert Development</h3>
              <p className="text-gray-600">
                Clean, maintainable code built with the latest technologies and
                best practices.
              </p>
            </div>
            <div className="card card-hover p-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-xl text-white shadow-[0_10px_30px_rgba(2,132,199,0.28)]"
                   style={{ background: "linear-gradient(135deg,#2563eb,#0ea5e9,#a78bfa)" }}>
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
      <section className="py-20">
        <div className="container-page">
          <div className="card card-hover p-10 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 -z-10">
              <div className="absolute -top-28 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary-400/20 blur-3xl" />
              <div className="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-blue-500/15 blur-3xl" />
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-6 text-slate-900">
              Ready to Get Started?
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Choose a plan that fits your needs and launch your online presence today.
            </p>
          <Link
            href="/pricing"
            className="btn-primary"
          >
            View Pricing Plans
          </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
