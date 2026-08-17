"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

type AchievementShareButtonProps = {
  nama: string;
  subdit: string;
  gender: string;
  totalDistance: number;
  genderRank: number | null;
  overallRank: number | null;
};

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

function formatDistance(
  value: number
) {
  return value.toLocaleString(
    "id-ID",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}

function loadImage(
  src: string
): Promise<HTMLImageElement> {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image();

      image.onload = () =>
        resolve(image);

      image.onerror =
        reject;

      image.src = src;
    }
  );
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r =
    Math.min(
      radius,
      width / 2,
      height / 2
    );

  ctx.beginPath();

  ctx.moveTo(
    x + r,
    y
  );

  ctx.lineTo(
    x + width - r,
    y
  );

  ctx.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + r
  );

  ctx.lineTo(
    x + width,
    y + height - r
  );

  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - r,
    y + height
  );

  ctx.lineTo(
    x + r,
    y + height
  );

  ctx.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - r
  );

  ctx.lineTo(
    x,
    y + r
  );

  ctx.quadraticCurveTo(
    x,
    y,
    x + r,
    y
  );

  ctx.closePath();
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  font: string,
  fillStyle: string
) {
  ctx.save();

  ctx.font =
    font;

  ctx.fillStyle =
    fillStyle;

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  ctx.fillText(
    text,
    STORY_WIDTH / 2,
    y
  );

  ctx.restore();
}

// function getAchievementFonts() {
//   return {
//     display: `"Rammetto One", "Open Sans", sans-serif`,
//     body: `"Open Sans", sans-serif`,
//   };
// }

export default function AchievementShareButton({
  nama,
  subdit,
  gender,
  totalDistance,
  genderRank,
  overallRank,
}: AchievementShareButtonProps) {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    editableName,
    setEditableName,
  ] = useState(nama);

  const [
    isGenerating,
    setIsGenerating,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const genderLabel =
    useMemo(
      () =>
        gender === "M"
          ? "MALE RANK"
          : "FEMALE RANK",
      [gender]
    );

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow =
        document.body.style.overflow;

    document.body.style.overflow =
        "hidden";

    return () => {
        document.body.style.overflow =
        previousOverflow;
    };
    }, [isOpen]);

  async function generateImage() {
    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      STORY_WIDTH;

    canvas.height =
      STORY_HEIGHT;

    const ctx =
      canvas.getContext(
        "2d"
      );

    if (!ctx) {
      throw new Error(
        "Canvas tidak tersedia."
      );
    }

    // await document.fonts.ready;

    // const fonts =
    //     getAchievementFonts();

    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        STORY_WIDTH,
        STORY_HEIGHT
      );

    gradient.addColorStop(
      0,
      "#090816"
    );

    gradient.addColorStop(
      0.45,
      "#120b2b"
    );

    gradient.addColorStop(
      1,
      "#070611"
    );

    ctx.fillStyle =
      gradient;

    ctx.fillRect(
      0,
      0,
      STORY_WIDTH,
      STORY_HEIGHT
    );

    const glow =
      ctx.createRadialGradient(
        STORY_WIDTH / 2,
        660,
        60,
        STORY_WIDTH / 2,
        660,
        580
      );

    glow.addColorStop(
      0,
      "rgba(139, 92, 246, 0.30)"
    );

    glow.addColorStop(
      0.5,
      "rgba(109, 40, 217, 0.12)"
    );

    glow.addColorStop(
      1,
      "rgba(109, 40, 217, 0)"
    );

    ctx.fillStyle =
      glow;

    ctx.fillRect(
      0,
      100,
      STORY_WIDTH,
      1200
    );

    let logo: HTMLImageElement | null =
      null;

    let trophy: HTMLImageElement | null =
      null;

    try {
      logo =
        await loadImage(
          "/image/logo-putih.png"
        );
    } catch {
      logo = null;
    }

    try {
      trophy =
        await loadImage(
          "/image/trophy.png"
        );
    } catch {
      trophy = null;
    }

    if (logo) {
      const logoWidth =
        190;

      const ratio =
        logo.height /
        logo.width;

      const logoHeight =
        logoWidth *
        ratio;

      ctx.drawImage(
        logo,
        STORY_WIDTH -
          logoWidth -
          80,
        70,
        logoWidth,
        logoHeight
      );
    }

    ctx.save();

    ctx.fillStyle =
    "#8b5cf6";

    ctx.font =
    `400 58px "Rammetto One", "Open Sans", sans-serif`;

    ctx.textAlign =
    "left";

    ctx.fillText(
    "ATLANTIK",
    80,
    120
    );

    ctx.fillText(
    "RUN",
    80,
    175
    );

    ctx.font =
    `700 28px "Open Sans", sans-serif`;

    ctx.fillStyle =
    "#ffffff";

    ctx.fillText(
    "2026",
    83,
    218
    );

    ctx.restore();

    drawCenteredText(
      ctx,
      "WE MADE IT TO",
      340,
      `700 42px "Open Sans", sans-serif`,
      "#ffffff"
    );

    drawCenteredText(
      ctx,
      "THE FINISH LINE!",
      415,
      `800 72px "Rammetto One", "Open Sans", sans-serif`,
      "#a855f7"
    );

    if (trophy) {
      const maxWidth =
        500;

      const ratio =
        trophy.height /
        trophy.width;

      const drawWidth =
        maxWidth;

      const drawHeight =
        maxWidth *
        ratio;

      ctx.drawImage(
        trophy,
        STORY_WIDTH / 2 -
          drawWidth / 2,
        500,
        drawWidth,
        drawHeight
      );
    }

    const cardX =
      90;

    const cardY =
      1040;

    const cardWidth =
      STORY_WIDTH - 180;

    const cardHeight =
      235;

    ctx.save();

    roundedRect(
      ctx,
      cardX,
      cardY,
      cardWidth,
      cardHeight,
      34
    );

    ctx.fillStyle =
      "rgba(19, 14, 38, 0.88)";

    ctx.fill();

    ctx.strokeStyle =
      "rgba(168, 85, 247, 0.75)";

    ctx.lineWidth =
      3;

    ctx.stroke();

    ctx.restore();

    drawCenteredText(
      ctx,
      editableName
        .trim()
        .toUpperCase(),
      1110,
      `800 56px "Open Sans", sans-serif`,
      "#ffffff"
    );

    drawCenteredText(
      ctx,
      subdit.toUpperCase(),
      1178,
      `800 38px "Open Sans", sans-serif`,
      "#a855f7"
    );

    drawCenteredText(
      ctx,
      "TOTAL DISTANCE",
      1320,
      `700 28px "Open Sans", sans-serif`,
      "#a855f7"
    );

    drawCenteredText(
      ctx,
      formatDistance(
        totalDistance
      ),
      1410,
      `800 94px "Rammetto One", "Open Sans", sans-serif`,
      "#ffffff"
    );

    drawCenteredText(
      ctx,
      "KM",
      1480,
      `800 30px "Open Sans", sans-serif`,
      "#a855f7"
    );

    const statY =
      1550;

    const statHeight =
      155;

    const statWidth =
      390;

    const gap =
      38;

    const firstX =
      STORY_WIDTH / 2 -
      statWidth -
      gap / 2;

    const secondX =
      STORY_WIDTH / 2 +
      gap / 2;

    [
      {
        x: firstX,
        value:
          genderRank
            ? `#${genderRank}`
            : "-",
        label:
          genderLabel,
      },
      {
        x: secondX,
        value:
          overallRank
            ? `#${overallRank}`
            : "-",
        label:
          "OVERALL RANK",
      },
    ].forEach(
      ({
        x,
        value,
        label,
      }) => {
        ctx.save();

        roundedRect(
          ctx,
          x,
          statY,
          statWidth,
          statHeight,
          28
        );

        ctx.fillStyle =
          "rgba(16, 12, 34, 0.78)";

        ctx.fill();

        ctx.strokeStyle =
          "rgba(139, 92, 246, 0.72)";

        ctx.lineWidth =
          3;

        ctx.stroke();

        ctx.restore();

        ctx.save();

        ctx.textAlign =
          "center";

        ctx.fillStyle =
          "#a855f7";

        ctx.font =
          `800 56px "Open Sans", sans-serif`;

        ctx.fillText(
          value,
          x +
            statWidth / 2,
          statY + 70
        );

        ctx.fillStyle =
          "#ffffff";

        ctx.font =
          `600 24px "Open Sans", sans-serif`;

        ctx.fillText(
          label,
          x +
            statWidth / 2,
          statY + 120
        );

        ctx.restore();
      }
    );

    drawCenteredText(
      ctx,
      "Thank you for running with us.",
      1815,
      `500 30px "Open Sans", sans-serif`,
      "#ffffff"
    );

    drawCenteredText(
      ctx,
      "SEE YOU ON THE NEXT CHALLENGE!",
      1865,
      `800 30px "Open Sans", sans-serif`,
      "#a855f7"
    );

    return new Promise<Blob>(
      (
        resolve,
        reject
      ) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(
                new Error(
                  "Gagal membuat gambar."
                )
              );

              return;
            }

            resolve(blob);
          },
          "image/png",
          1
        );
      }
    );
  }

  async function handleDownload() {
    setError(null);

    setIsGenerating(
        true
    );

    try {
        const blob =
        await generateImage();

        const url =
        URL.createObjectURL(
            blob
        );

        const link =
        document.createElement(
            "a"
        );

        link.href =
        url;

        link.download =
        "atlantik-run-achievement.png";

        document.body.appendChild(
        link
        );

        link.click();

        link.remove();

        window.setTimeout(
        () => {
            URL.revokeObjectURL(
            url
            );
        },
        1000
        );
    } catch (err) {
        console.error(err);

        setError(
        "Gagal membuat achievement image. Coba lagi."
        );
    } finally {
        setIsGenerating(
        false
        );
    }
    }

  return (
    <>
        <button
        type="button"
        className="run-achievement-button"
        onClick={() =>
            setIsOpen(true)
        }
        >
        <span>
            Share My Achievement
        </span>

        <span aria-hidden="true">
            ↗
        </span>
        </button>

        {isOpen &&
        typeof document !==
        "undefined"
        ? createPortal(
            <div
                className="achievement-modal-backdrop"
                role="presentation"
                onMouseDown={() =>
                setIsOpen(false)
                }
            >
                <section
                className="achievement-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="achievement-modal-title"
                onMouseDown={(
                    event
                ) =>
                    event.stopPropagation()
                }
                >
                <button
                    type="button"
                    className="achievement-modal-close"
                    onClick={() =>
                    setIsOpen(
                        false
                    )
                    }
                    aria-label="Tutup"
                >
                    ×
                </button>

                <span className="achievement-modal-kicker">
                    ATLANTIK RUN
                </span>

                <h2 id="achievement-modal-title">
                    Share Your Achievement
                </h2>

                <p className="achievement-modal-description">
                    Kamu bisa menyesuaikan
                    nama yang tampil sebelum
                    achievement image dibuat.
                </p>

                <label className="achievement-field">
                    <span>
                    Nama yang ditampilkan
                    </span>

                    <input
                    type="text"
                    value={
                        editableName
                    }
                    maxLength={32}
                    onChange={(
                        event
                    ) =>
                        setEditableName(
                        event
                            .target
                            .value
                        )
                    }
                    />

                    <small>
                    {
                        editableName.length
                    }
                    /32
                    </small>
                </label>

                <div className="achievement-summary">
                    <div>
                    <span>
                        Subdit
                    </span>

                    <strong>
                        {subdit}
                    </strong>
                    </div>

                    <div>
                    <span>
                        Total Jarak
                    </span>

                    <strong>
                        {formatDistance(
                        totalDistance
                        )}{" "}
                        km
                    </strong>
                    </div>

                    <div>
                    <span>
                        {genderLabel}
                    </span>

                    <strong>
                        {genderRank
                        ? `#${genderRank}`
                        : "-"}
                    </strong>
                    </div>

                    <div>
                    <span>
                        Overall Rank
                    </span>

                    <strong>
                        {overallRank
                        ? `#${overallRank}`
                        : "-"}
                    </strong>
                    </div>
                </div>

                {error ? (
                    <p className="achievement-error">
                    {error}
                    </p>
                ) : null}

                <button
                type="button"
                className="achievement-share-submit"
                disabled={
                    isGenerating ||
                    !editableName.trim()
                }
                onClick={handleDownload}
                >
                {isGenerating
                    ? "Membuat Image..."
                    : "Share Achievement"}
                </button>

                <p className="achievement-share-note">
                Gambar akan dibuat dalam
                format Instagram Story
                dan disimpan ke perangkatmu.
                </p>
                </section>
            </div>,
            document.body
            )
        : null}
    </>
    );
}