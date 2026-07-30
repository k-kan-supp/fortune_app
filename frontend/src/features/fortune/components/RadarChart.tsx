import { useId, useState } from "react";

export interface RadarPoint {
  /** 軸の表示名（言語解決済み） */
  label: string;
  value: number;
}

interface Props {
  points: RadarPoint[];
  /** 外周にあたる値。軸の値はこれを 1.0 として描く。 */
  maxValue: number;
  /** SVG の読み上げ用ラベル（チャートの表題）。 */
  title: string;
  /** 軸をクリックしたとき（用語解説を出す）。渡さなければクリック不可。 */
  onSelectAxis?: (index: number) => void;
}

// 座標系。ラベルは外周のさらに外側に置くので、その分の余白を viewBox に含める。
const VIEW_W = 300;
const VIEW_H = 236;
const CX = 150;
const CY = 114;
const R = 76;
const LABEL_R = 97;
const RINGS = 4;

/** 12時の位置から時計回りに ``index`` 番目の軸の座標。 */
function pointAt(index: number, count: number, radius: number) {
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
  return { x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle), angle };
}

const polygon = (count: number, radius: number): string =>
  Array.from({ length: count }, (_, i) => {
    const { x, y } = pointAt(i, count, radius);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");

/** 軸が担当する扇形。ここ全体をホバーの当たり判定にする（値が0でも掴める）。 */
function wedgePath(index: number, count: number): string {
  const half = Math.PI / count;
  const { angle } = pointAt(index, count, 0);
  const [from, to] = [angle - half, angle + half];
  const p = (a: number) =>
    `${(CX + LABEL_R * Math.cos(a)).toFixed(2)},${(CY + LABEL_R * Math.sin(a)).toFixed(2)}`;
  return `M ${CX},${CY} L ${p(from)} A ${LABEL_R},${LABEL_R} 0 0 1 ${p(to)} Z`;
}

/** 長いラベルは空白で2行に折り返す（軸ラベル同士の衝突を避けるため）。 */
function wrap(label: string): string[] {
  if (label.length <= 7 || !label.includes(" ")) return [label];
  const words = label.split(" ");
  const middle = Math.ceil(words.length / 2);
  return [words.slice(0, middle).join(" "), words.slice(middle).join(" ")];
}

/** 軸が増えるほどラベル同士の間隔が詰まるので、字を小さくして逃がす。 */
const labelFontSize = (count: number): number => (count >= 12 ? 8.5 : count >= 10 ? 9 : 10);

/**
 * 直接ラベルを頂点のどちら側に置くか。
 * 下半分の頂点は形の外（下）に出す。ただし外周近くだと軸ラベルにぶつかるので、
 * その場合だけ内側（上）に戻す。
 */
const peakOffset = (y: number, radius: number): number =>
  y > CY && radius < R * 0.85 ? 15 : -9;

export const formatValue = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

/**
 * 単系列のレーダーチャート。
 * 系列がひとつなので凡例は置かず、表題がそのまま系列名になる。
 * 値は最大の軸だけを直接ラベルし、残りはホバーと数値表（呼び出し側）で読ませる。
 */
export function RadarChart({ points, maxValue, title, onSelectAxis }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const titleId = useId();
  const count = points.length;
  const scale = maxValue > 0 ? R / maxValue : 0;
  const radiusOf = (value: number) => Math.min(Math.max(value, 0) * scale, R);

  const vertices = points.map((p, i) => pointAt(i, count, radiusOf(p.value)));

  // 直接ラベルは「山」がひとつに定まるときだけ出す（全点に数値を振らない）
  const peak = points.reduce((best, p, i) => (p.value > points[best].value ? i : best), 0);
  const unique = points.filter((p) => p.value === points[peak].value).length === 1;
  const labelled = unique && points[peak].value > 0 ? peak : null;

  const active = hovered ?? labelled;

  return (
    <div className="radar" onPointerLeave={() => setHovered(null)}>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-labelledby={titleId}>
        <title id={titleId}>{title}</title>

        <g className="radar-grid" aria-hidden="true">
          {Array.from({ length: RINGS }, (_, i) => (
            <polygon key={i} points={polygon(count, (R * (i + 1)) / RINGS)} />
          ))}
          {points.map((_, i) => {
            const { x, y } = pointAt(i, count, R);
            return <line key={i} x1={CX} y1={CY} x2={x} y2={y} />;
          })}
        </g>

        {/* 目盛り: 外周と中間の値。軸ラベルとぶつからないよう縦軸のすぐ右に置く */}
        <g className="radar-tick" aria-hidden="true">
          <text x={CX + 4} y={CY - R + 3}>
            {formatValue(maxValue)}
          </text>
          <text x={CX + 4} y={CY - R / 2 + 3}>
            {formatValue(maxValue / 2)}
          </text>
        </g>

        <polygon
          className="radar-area"
          points={vertices.map((v) => `${v.x.toFixed(2)},${v.y.toFixed(2)}`).join(" ")}
        />

        {points.map((_, i) => {
          const { x, y } = vertices[i];
          return (
            <circle
              key={i}
              className={`radar-dot${active === i ? " is-active" : ""}`}
              cx={x}
              cy={y}
              r={active === i ? 5 : 4}
            />
          );
        })}

        {/* 最大の軸にだけ数値を添える */}
        {labelled !== null && hovered === null && (
          <text
            className="radar-peak"
            x={vertices[labelled].x}
            y={vertices[labelled].y + peakOffset(vertices[labelled].y, radiusOf(points[labelled].value))}
            textAnchor={
              Math.abs(vertices[labelled].x - CX) < 2
                ? "middle"
                : vertices[labelled].x > CX
                  ? "start"
                  : "end"
            }
          >
            {formatValue(points[labelled].value)}
          </text>
        )}

        <g className="radar-axis-label" fontSize={labelFontSize(count)}>
          {points.map((point, i) => {
            const { x, y } = pointAt(i, count, LABEL_R);
            const dx = x - CX;
            const anchor = Math.abs(dx) < 2 ? "middle" : dx > 0 ? "start" : "end";
            const lines = wrap(point.label);
            const lineHeight = labelFontSize(count) + 1.5;
            const top = y - ((lines.length - 1) * lineHeight) / 2;
            return (
              <text
                key={i}
                x={x}
                y={top}
                textAnchor={anchor}
                dominantBaseline="middle"
                className={active === i ? "is-active" : undefined}
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

        {/* 当たり判定は扇形。マークより十分に広く、値が0でも掴める */}
        {/* onSelectAxis があるときは、この扇形がそのまま用語解説のボタンになる */}
        <g className={`radar-hit${onSelectAxis ? " is-clickable" : ""}`}>
          {points.map((point, i) => (
            <path
              key={i}
              d={wedgePath(i, count)}
              onPointerMove={() => setHovered(i)}
              onClick={onSelectAxis ? () => onSelectAxis(i) : undefined}
              onKeyDown={
                onSelectAxis
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectAxis(i);
                      }
                    }
                  : undefined
              }
              role={onSelectAxis ? "button" : undefined}
              tabIndex={onSelectAxis ? 0 : undefined}
              aria-label={onSelectAxis ? point.label : undefined}
            />
          ))}
        </g>
      </svg>

      {hovered !== null && (
        <div
          className="radar-tip"
          style={{
            left: `${(vertices[hovered].x / VIEW_W) * 100}%`,
            top: `${(vertices[hovered].y / VIEW_H) * 100}%`,
          }}
        >
          <span className="radar-tip-value">{formatValue(points[hovered].value)}</span>
          <span className="radar-tip-label">{points[hovered].label}</span>
        </div>
      )}
    </div>
  );
}
