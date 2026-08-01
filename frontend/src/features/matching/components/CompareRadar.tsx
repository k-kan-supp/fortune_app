import { useId } from "react";
import {
  anchorFor,
  CX,
  CY,
  LABEL_R,
  labelFontSize,
  pointAt,
  polygon,
  R,
  RINGS,
  valuePolygon,
  VIEW_H,
  VIEW_W,
  wrap,
} from "@/features/fortune/radarGeometry";

interface Props {
  /** 軸の表示名（言語解決済み）。 */
  labels: string[];
  you: number[];
  them: number[];
  maxValue: number;
  /** 強調する軸の位置。判断の決め手になった軸を指す。 */
  highlight: number[];
  /** 凡例の文言。 */
  youLabel: string;
  themLabel: string;
  /** SVG の読み上げ用ラベル。 */
  title: string;
}

/**
 * ``index`` の軸が受け持つ区画。外周の多角形にぴたりと収まるよう、
 * 中心 → 隣の軸との辺の中点 → 頂点 → 反対隣との中点 で囲う。
 */
function sector(index: number, count: number): string {
  const vertex = (i: number) => pointAt((i + count) % count, count, R);
  const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });
  const here = vertex(index);
  const corners = [
    { x: CX, y: CY },
    mid(vertex(index - 1), here),
    here,
    mid(here, vertex(index + 1)),
  ];
  return corners.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}

/**
 * 二人分の構成比を重ねて見せるレーダー。
 *
 * 系列が2つあるので凡例は必須。色だけに頼らないよう、相手側は破線にして
 * 線の形でも見分けられるようにしてある（色覚特性のある人・白黒印刷向け）。
 * 判断の決め手になった軸は、扇形をうっすら塗って軸名を濃くする。
 */
export function CompareRadar({
  labels,
  you,
  them,
  maxValue,
  highlight,
  youLabel,
  themLabel,
  title,
}: Props) {
  const titleId = useId();
  const count = labels.length;
  const highlighted = new Set(highlight);

  return (
    <div className="compare-radar">
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-labelledby={titleId}>
        <title id={titleId}>{title}</title>

        {/* 決め手になった軸を、外周の多角形に沿って区画で塗る */}
        <g className="compare-highlight" aria-hidden="true">
          {labels.map((_, i) => (highlighted.has(i) ? <polygon key={i} points={sector(i, count)} /> : null))}
        </g>

        <g className="radar-grid" aria-hidden="true">
          {Array.from({ length: RINGS }, (_, i) => (
            <polygon key={i} points={polygon(count, (R * (i + 1)) / RINGS)} />
          ))}
          {labels.map((_, i) => {
            const { x, y } = pointAt(i, count, R);
            return <line key={i} x1={CX} y1={CY} x2={x} y2={y} />;
          })}
        </g>

        <polygon className="compare-area compare-area--them" points={valuePolygon(them, maxValue)} />
        <polygon className="compare-area compare-area--you" points={valuePolygon(you, maxValue)} />

        <g className="radar-axis-label" fontSize={labelFontSize(count)}>
          {labels.map((label, i) => {
            const { x, y } = pointAt(i, count, LABEL_R);
            const lines = wrap(label);
            const lineHeight = labelFontSize(count) + 1.5;
            return (
              <text
                key={i}
                x={x}
                y={y - ((lines.length - 1) * lineHeight) / 2}
                textAnchor={anchorFor(x)}
                dominantBaseline="middle"
                className={highlighted.has(i) ? "is-active" : undefined}
              >
                {lines.map((line, n) => (
                  <tspan key={n} x={x} dy={n === 0 ? 0 : lineHeight}>
                    {line}
                  </tspan>
                ))}
              </text>
            );
          })}
        </g>
      </svg>

      {/* 系列が2つあるので凡例は省略しない */}
      <ul className="compare-legend">
        <li>
          <span className="compare-key compare-key--you" aria-hidden="true" />
          {youLabel}
        </li>
        <li>
          <span className="compare-key compare-key--them" aria-hidden="true" />
          {themLabel}
        </li>
      </ul>
    </div>
  );
}
