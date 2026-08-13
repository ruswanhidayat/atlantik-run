import Image from "next/image";
import Link from "next/link";

import RunBottomNav from "@/app/components/run-bottom-nav";
import { requireUser } from "@/lib/auth";

const guideSteps = [
  {
    number: "01",
    title: "Bergabung ke Club ATLANTIK RUN",
    description:
      "Pastikan akun Strava telah bergabung ke Club ATLANTIK RUN sebelum mengikuti perlombaan.",
  },
  {
    number: "02",
    title: "Gunakan nama sesuai SIKKA",
    description:
      "Nama akun Strava harus menggunakan nama yang sesuai dengan data SIKKA agar aktivitas dapat diidentifikasi oleh panitia.",
  },
  {
    number: "03",
    title: "Atur judul aktivitas",
    description:
      "Gunakan #atlantikrun dan #runfor(subdit) pada judul aktivitas. Contoh: #atlantikrun #runforpiksi.",
  },
  {
    number: "04",
    title: "Atur Activity Tag menjadi RACE",
    description:
      "Setelah aktivitas selesai direkam, ubah Activity Tag pada aktivitas Strava menjadi RACE.",
    images: [
      {
        src: "/image/strava/3-ganti-activity-tag.jpeg",
        alt: "Cara mengganti Activity Tag di Strava",
        caption: "Pilih bagian Activity Tag pada halaman Edit Activity.",
      },
      {
        src: "/image/strava/4-pilih-race.jpeg",
        alt: "Memilih Activity Tag Race di Strava",
        caption: "Pilih RACE sebagai Activity Tag.",
      },
    ],
  },
  {
    number: "05",
    title: "Atur Visibility menjadi EVERYONE",
    description:
      "Pastikan visibility aktivitas diatur menjadi EVERYONE agar aktivitas dapat dilihat dan diverifikasi oleh panitia.",
    images: [
      {
        src: "/image/strava/5-set-visibility-to-everyone.jpeg",
        alt: "Mengatur Visibility aktivitas Strava menjadi Everyone",
        caption: "Atur Activity Visibility menjadi EVERYONE.",
      },
    ],
  },
  {
    number: "06",
    title: "Pastikan Auto-Pause tidak digunakan",
    description:
      "Selama perlombaan berlangsung, peserta tidak diperbolehkan menggunakan pause manual maupun fitur auto-pause.",
  },
  {
    number: "07",
    title: "Salin link aktivitas",
    description:
      "Setelah seluruh pengaturan selesai, salin link aktivitas Strava dan gunakan link tersebut pada halaman perekaman ATLANTIK RUN.",
  },
];

export default async function InfoPage() {
  const user = await requireUser();

  return (
    <main className="run-app run-info-page">
      <div
        className="run-app-glow run-app-glow-one"
        aria-hidden="true"
      />

      <div
        className="run-app-glow run-app-glow-two"
        aria-hidden="true"
      />

      <header className="run-topbar">
        <span className="run-brand">
          <span className="run-brand-dot" />
          <span>ATLANTIK RUN</span>
          <small>2026</small>
        </span>
      </header>

      <div className="run-info-container">
        <section className="run-info-heading">
          <span className="dashboard-section-kicker">
            PANDUAN PESERTA
          </span>

          <h1>
            Persiapan Aktivitas
            <br />
            di Strava
          </h1>

          <p>
            Ikuti panduan berikut sebelum mengirim
            aktivitas ATLANTIK RUN agar data dapat
            diverifikasi oleh panitia.
          </p>
        </section>

        <div className="run-info-notice">
          <span
            className="run-info-notice-icon"
            aria-hidden="true"
          >
            i
          </span>

          <p>
            Pastikan pengaturan aktivitas pada Strava
            sudah sesuai sebelum link dikirim melalui
            halaman perekaman.
          </p>
        </div>

        <section className="run-info-steps">
          {guideSteps.map((step) => (
            <article
              key={step.number}
              className="run-info-step"
            >
              <div className="run-info-step-copy">
                <span className="run-info-step-number">
                  {step.number}
                </span>

                <div>
                  <h2>{step.title}</h2>
                  <p>{step.description}</p>
                </div>
              </div>

              {step.images?.length ? (
                <div className="run-info-guide-images">
                  {step.images.map((image) => (
                    <figure
                      key={image.src}
                      className="run-info-guide-figure"
                    >
                      <div className="run-info-guide-image">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          width={720}
                          height={1587}
                          sizes="(max-width: 760px) 82vw, 360px"
                        />
                      </div>

                      <figcaption>
                        {image.caption}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </section>

        <div className="run-info-footer-note">
          <strong>Sudah siap?</strong>

          <p>
            Setelah aktivitas selesai dan seluruh
            pengaturan sudah sesuai, lanjutkan ke
            halaman perekaman.
          </p>

          <Link
            href="/record"
            className="run-info-record-link"
          >
            Rekam Aktivitas
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <RunBottomNav
        active="info"
        isAdmin={Boolean(user.isadmin)}
      />
    </main>
  );
}