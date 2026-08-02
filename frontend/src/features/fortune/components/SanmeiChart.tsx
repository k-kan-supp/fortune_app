import { useState } from "react";
import { findMessage, useI18n, type MessageKey } from "@/i18n";
import { starLabel } from "../terms";
import type { Sanmei } from "../types";

/** 押されたマスの中身。主星と従星で出せる情報が違うので、ここで揃えておく。 */
interface Selection {
  star: string;
  /** 位置（頭・胸…）または時期（初年・中年・晩年）の名前。 */
  where: string;
  /** その位置が何を見ているか。 */
  role: string;
  /** どこから導いたか。 */
  basis: string;
  glossaryNs: "mainStar" | "followerStar";
}

/**
 * 算命学の陽占（人体星図）。
 *
 * 3×3 のうち、中列に主星（頭・胸・腹）、左右に手の主星、
 * 四隅に十二大従星を置く伝統的な並びをそのまま組む。
 * 星の判定はバックエンド、ここは配置と解説の引き当てだけ。
 */
export function SanmeiChart({ sanmei }: { sanmei: Sanmei }) {
  const { t, lang } = useI18n();
  const [picked, setPicked] = useState<Selection | null>(null);

  const stars = Object.fromEntries(sanmei.stars.map((s) => [s.position, s]));
  const followers = Object.fromEntries(sanmei.followers.map((f) => [f.period, f]));

  function pickStar(position: string): void {
    const star = stars[position];
    if (!star) return;
    setPicked({
      star: star.star,
      where: t(`fortune.sanmei.positions.${position}.label` as MessageKey),
      role: t(`fortune.sanmei.positions.${position}.role` as MessageKey),
      basis: t("fortune.sanmei.basis", {
        source: t(`fortune.sanmei.sources.${star.source}` as MessageKey),
      }),
      glossaryNs: "mainStar",
    });
  }

  function pickFollower(period: string): void {
    const follower = followers[period];
    if (!follower) return;
    setPicked({
      star: follower.star,
      where: t(`fortune.sanmei.periods.${period}.label` as MessageKey),
      role: t(`fortune.sanmei.periods.${period}.range` as MessageKey),
      basis: t("fortune.sanmei.energyUnit", { energy: follower.energy }),
      glossaryNs: "followerStar",
    });
  }

  const cell = (position: string) => {
    const star = stars[position];
    if (!star) return <div className="sanmei-cell sanmei-cell--empty" aria-hidden="true" />;
    const isCenter = position === "chest";
    return (
      <button
        type="button"
        className={`sanmei-cell sanmei-cell--main${isCenter ? " is-center" : ""}${
          picked?.star === star.star ? " is-picked" : ""
        }`}
        onClick={() => pickStar(position)}
      >
        <span className="sanmei-where">{t(`fortune.sanmei.positions.${position}.label` as MessageKey)}</span>
        <span className="sanmei-star">{starLabel(star.star, lang)}</span>
      </button>
    );
  };

  const followerCell = (period: string) => {
    const follower = followers[period];
    if (!follower) return <div className="sanmei-cell sanmei-cell--empty" aria-hidden="true" />;
    return (
      <button
        type="button"
        className={`sanmei-cell sanmei-cell--follower${
          picked?.star === follower.star ? " is-picked" : ""
        }`}
        onClick={() => pickFollower(period)}
      >
        <span className="sanmei-where">{t(`fortune.sanmei.periods.${period}.label` as MessageKey)}</span>
        <span className="sanmei-star">{starLabel(follower.star, lang)}</span>
        <span className="sanmei-energy">{t("fortune.sanmei.energyUnit", { energy: follower.energy })}</span>
      </button>
    );
  };

  const detail = picked && findMessage(lang, `glossary.${picked.glossaryNs}.${picked.star}`);

  return (
    <section className="sanmei-section">
      <div className="result-head">
        <h2>{t("fortune.sanmei.title")}</h2>
        <p className="hint">{t("fortune.sanmei.hint")}</p>
      </div>

      <div className="sanmei-grid">
        {followerCell("early")}
        {cell("head")}
        {followerCell("middle")}
        {cell("right_hand")}
        {cell("chest")}
        {cell("left_hand")}
        <div className="sanmei-cell sanmei-cell--empty" aria-hidden="true" />
        {cell("belly")}
        {followerCell("late")}
      </div>

      <p className="sanmei-total">
        <b>
          {t("fortune.sanmei.centerLabel")}: {starLabel(sanmei.center, lang)}
        </b>
        <span>{t("fortune.sanmei.energyTotal", { total: sanmei.energy_total })}</span>
      </p>

      <div className="sanmei-detail">
        {picked ? (
          <>
            <h3>
              {starLabel(picked.star, lang)}
              <span>
                {picked.where} — {picked.basis}
              </span>
            </h3>
            <p className="sanmei-role">{picked.role}</p>
            {detail && <p>{detail}</p>}
          </>
        ) : (
          <p className="hint">{t("fortune.sanmei.pick")}</p>
        )}
      </div>
    </section>
  );
}
