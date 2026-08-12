<article className="personal-stat-card personal-stat-card-info">
  <button
    type="button"
    className="stat-info"
    aria-label={`Informasi Rank ${
      user.gender === "M" ? "Pria" : "Wanita"
    }`}
  >
    ?
    <span className="stat-tooltip">
      Peringkat personal berdasarkan total jarak
      Approved dibandingkan dengan seluruh pelari{" "}
      {user.gender === "M" ? "pria" : "wanita"}.
    </span>
  </button>

  <span>
    Rank{" "}
    {user.gender === "M"
      ? "Pria"
      : "Wanita"}
  </span>

  <strong>
    {personalStats.genderRank
      ? `#${personalStats.genderRank}`
      : "-"}
  </strong>
</article>

<article className="personal-stat-card personal-stat-card-info">
  <button
    type="button"
    className="stat-info"
    aria-label="Informasi Overall Rank"
  >
    ?
    <span className="stat-tooltip">
      Peringkat personal berdasarkan total jarak
      Approved dibandingkan dengan seluruh pelari,
      tanpa membedakan gender.
    </span>
  </button>

  <span>Overall Rank</span>

  <strong>
    {personalStats.overallRank
      ? `#${personalStats.overallRank}`
      : "-"}
  </strong>
</article>