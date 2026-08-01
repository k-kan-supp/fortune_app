import { useId, useMemo, useState } from "react";
import {
  anchorFor,
  CX,
  CY,
  formatValue,
  LABEL_R,
  labelFontSize,
  pointAt,
  polygon,
  R,
  RINGS,
  VIEW_H,
  VIEW_W,
  wedgePath,
  wrap,
} from "../radarGeometry";

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

/**
 * 直接ラベルを頂点のどちら側に置くか。
 * 下半分の頂点は形の外（下）に出す。ただし外周近くだと軸ラベルにぶつかるので、
 * その場合だけ内側（上）に戻す。
 */
const peakOffset = (y: number, radius: number): number =>
  y > CY && radius < R * 0.85 ? 15 : -9;

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
  const fontSize = labelFontSize(count);

  // 目盛り・軸線・当たり判定は軸数だけで決まるので、ホバーのたびに作り直さない
  const frame = useMemo(
    () => ({
      rings: Array.from({ length: RINGS }, (_, i) => polygon(count, (R * (i + 1)) / RINGS)),
      spokes: Array.from({ length: count }, (_, i) => pointAt(i, count, R)),
      wedges: Array.from({ length: count }, (_, i) => wedgePath(i, count)),
      labels: Array.from({ length: count }, (_, i) => pointAt(i, count, LABEL_R)),
    }),
    [count],
  );

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
          {frame.rings.map((ring, i) => (
            <polygon key={i} points={ring} />
          ))}
          {frame.spokes.map(({ x, y }, i) => (
            <line key={i} x1={CX} y1={CY} x2={x} y2={y} />
          ))}
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
            y={
              vertices[labelled].y +
              peakOffset(vertices[labelled].y, radiusOf(points[labelled].value))
            }
            textAnchor={anchorFor(vertices[labelled].x)}
          >
            {formatValue(points[labelled].value)}
          </text>
        )}

        <g className="radar-axis-label" fontSize={fontSize}>
          {points.map((point, i) => {
            const { x, y } = frame.labels[i];
            const lines = wrap(point.label);
            const lineHeight = fontSize + 1.5;
            const top = y - ((lines.length - 1) * lineHeight) / 2;
            return (
              <text
                key={i}
                x={x}
                y={top}
                textAnchor={anchorFor(x)}
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
              d={frame.wedges[i]}
              onPointerEnter={() => setHovered(i)}
              // キーボードでも、ホバーと同じ強調と数値が出るようにする
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
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
