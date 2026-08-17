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

    ctx.imageSmoothingEnabled =
        true;

    ctx.imageSmoothingQuality =
        "high";

    /*
    * =========================
    * LOAD ASSETS
    * =========================
    */

    let background:
        HTMLImageElement | null =
        null;

    let logo:
        HTMLImageElement | null =
        null;

    let trophy:
        HTMLImageElement | null =
        null;

    try {
        background =
        await loadImage(
            "/image/achievement-bg.png"
        );
    } catch {
        background = null;
    }

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

    /*
    * =========================
    * BACKGROUND
    * =========================
    */

    if (background) {
        ctx.drawImage(
        background,
        0,
        0,
        STORY_WIDTH,
        STORY_HEIGHT
        );
    } else {
        const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            STORY_HEIGHT
        );

        gradient.addColorStop(
        0,
        "#090816"
        );

        gradient.addColorStop(
        0.5,
        "#160b35"
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
    }

    /*
    * Sedikit vignette supaya data
    * personal tetap terbaca di atas
    * artwork.
    */
    const centerOverlay =
        ctx.createLinearGradient(
        0,
        850,
        0,
        1680
        );

    centerOverlay.addColorStop(
        0,
        "rgba(7, 5, 20, 0)"
    );

    centerOverlay.addColorStop(
        0.55,
        "rgba(7, 5, 20, 0.10)"
    );

    centerOverlay.addColorStop(
        1,
        "rgba(7, 5, 20, 0.28)"
    );

    ctx.fillStyle =
        centerOverlay;

    ctx.fillRect(
        0,
        820,
        STORY_WIDTH,
        900
    );

    /*
    * =========================
    * BRANDING
    * =========================
    */

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

    /*
    * Logo HUT RI dibuat lebih kecil
    * daripada versi sebelumnya.
    */
    if (logo) {
        const logoWidth =
        180;

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
            78,
        72,
        logoWidth,
        logoHeight
        );
    }

    /*
    * =========================
    * HEADLINE
    * =========================
    */

    drawCenteredText(
        ctx,
        "WE MADE IT TO",
        330,
        `700 40px "Open Sans", sans-serif`,
        "#ffffff"
    );

    drawCenteredText(
        ctx,
        "THE FINISH LINE!",
        405,
        `800 70px "Rammetto One", "Open Sans", sans-serif`,
        "#a855f7"
    );

    /*
    * =========================
    * TROPHY
    * =========================
    *
    * Dibuat lebih besar dan
    * diposisikan di pusat ribbon
    * background.
    */

    if (trophy) {
        const trophyWidth =
        750;

        const trophyRatio =
        trophy.height /
        trophy.width;

        const trophyHeight =
        trophyWidth *
        trophyRatio;

        const trophyX =
        STORY_WIDTH / 2 -
        trophyWidth / 2;

        const trophyY =
        460;

        /*
        * Glow lembut di belakang trophy.
        */
        ctx.save();

        const trophyGlow =
        ctx.createRadialGradient(
            STORY_WIDTH / 2,
            trophyY +
            trophyHeight * 0.48,
            40,
            STORY_WIDTH / 2,
            trophyY +
            trophyHeight * 0.48,
            340
        );

        trophyGlow.addColorStop(
        0,
        "rgba(168, 85, 247, 0.22)"
        );

        trophyGlow.addColorStop(
        1,
        "rgba(168, 85, 247, 0)"
        );

        ctx.fillStyle =
        trophyGlow;

        ctx.fillRect(
        170,
        430,
        740,
        700
        );

        ctx.restore();

        ctx.drawImage(
        trophy,
        trophyX,
        trophyY,
        trophyWidth,
        trophyHeight
        );
    }

    /*
    * =========================
    * PERSONAL CARD
    * =========================
    */

    const cardX =
        105;

    const cardY =
        1015;

    const cardWidth =
        STORY_WIDTH - 210;

    const cardHeight =
        170;

    ctx.save();

    roundedRect(
        ctx,
        cardX,
        cardY,
        cardWidth,
        cardHeight,
        30
    );

    ctx.fillStyle =
        "rgba(10, 7, 27, 0.74)";

    ctx.fill();

    ctx.strokeStyle =
        "rgba(168, 85, 247, 0.72)";

    ctx.lineWidth =
        3;

    ctx.stroke();

    ctx.restore();

    /*
    * Nama + Subdit benar-benar
    * vertically centered.
    */

    drawCenteredText(
        ctx,
        editableName
        .trim()
        .toUpperCase(),
        cardY + 62,
        `800 54px "Open Sans", sans-serif`,
        "#ffffff"
    );

    drawCenteredText(
        ctx,
        subdit.toUpperCase(),
        cardY + 118,
        `800 34px "Open Sans", sans-serif`,
        "#a855f7"
    );

    /*
    * =========================
    * DISTANCE
    * =========================
    */

    drawCenteredText(
        ctx,
        "TOTAL DISTANCE",
        1240,
        `700 27px "Open Sans", sans-serif`,
        "#b56cff"
        );

        const distanceText =
        formatDistance(
            totalDistance
        );

        const distanceFont =
        `800 88px "Rammetto One", "Open Sans", sans-serif`;

        const distanceUnitFont =
        `800 30px "Open Sans", sans-serif`;

        const distanceGap =
        18;

        ctx.save();

        ctx.font =
        distanceFont;

        const distanceWidth =
        ctx.measureText(
            distanceText
        ).width;

        ctx.font =
        distanceUnitFont;

        const unitWidth =
        ctx.measureText(
            "KM"
        ).width;

        const distanceGroupWidth =
        distanceWidth +
        distanceGap +
        unitWidth;

        const distanceStartX =
        STORY_WIDTH / 2 -
        distanceGroupWidth / 2;

        const distanceBaselineY =
        1340;

        /* ANGKA */

        ctx.font =
        distanceFont;

        ctx.fillStyle =
        "#ffffff";

        ctx.textAlign =
        "left";

        ctx.textBaseline =
        "alphabetic";

        ctx.fillText(
        distanceText,
        distanceStartX,
        distanceBaselineY
        );

        /* KM */

        ctx.font =
        distanceUnitFont;

        ctx.fillStyle =
        "#a855f7";

        ctx.fillText(
        "KM",
        distanceStartX +
            distanceWidth +
            distanceGap,
        distanceBaselineY
        );

        ctx.restore();

    /*
    * =========================
    * RANK CARDS
    * =========================
    */

    const statY =
        1440;

    const statHeight =
        142;

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
            26
        );

        ctx.fillStyle =
            "rgba(9, 6, 25, 0.76)";

        ctx.fill();

        ctx.strokeStyle =
            "rgba(139, 92, 246, 0.70)";

        ctx.lineWidth =
            3;

        ctx.stroke();

        ctx.restore();

        ctx.save();

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillStyle =
            "#a855f7";

        ctx.font =
            `800 52px "Open Sans", sans-serif`;

        ctx.fillText(
            value,
            x +
            statWidth / 2,
            statY + 55
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            `600 23px "Open Sans", sans-serif`;

        ctx.fillText(
            label,
            x +
            statWidth / 2,
            statY + 105
        );

        ctx.restore();
        }
    );

    /*
    * =========================
    * CLOSING
    * =========================
    *
    * Sengaja tidak terlalu bawah,
    * supaya skyline + road tetap
    * terlihat sebagai artwork.
    */

    drawCenteredText(
        ctx,
        "Thank you for running with us.",
        1645,
        `500 29px "Open Sans", sans-serif`,
        "#ffffff"
    );

    drawCenteredText(
        ctx,
        "SEE YOU ON THE NEXT CHALLENGE!",
        1695,
        `800 29px "Open Sans", sans-serif`,
        "#b45cff"
    );

    /*
    * =========================
    * EXPORT
    * =========================
    */

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
                    : "Download"}
                </button>

                <p className="achievement-share-note">
                Gambar akan dibuat dalam format Instagram Story dan disimpan ke perangkatmu.
                </p>
                </section>
            </div>,
            document.body
            )
        : null}
    </>
    );
}