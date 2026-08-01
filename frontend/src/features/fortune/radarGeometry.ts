/**
 * レーダーチャートの座標計算。
 * 単系列（RadarChart）と、二人分を重ねる比較用（CompareRadar）で共有する。
 */

// ラベルは外周のさらに外側に置くので、その分の余白を viewBox に含める。
export const VIEW_W = 300;
export const VIEW_H = 236;
export const CX = 150;
export const CY = 114;
export const R = 76;
export const LABEL_R = 97;
export const RINGS = 4;

/** 12時の位置から時計回りに ``index`` 番目の軸の座標。 */
export function pointAt(index: number, count: number, radius: number) {
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
  return { x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle), angle };
}

export const polygon = (count: number, radius: number): string =>
  Array.from({ length: count }, (_, i) => {
    const { x, y } = pointAt(i, count, radius);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");

/** 値の並びを、外周を ``maxValue`` として多角形の座標列にする。 */
export function valuePolygon(values: number[], maxValue: number): string {
  const scale = maxValue > 0 ? R / maxValue : 0;
  return values
    .map((value, i) => {
      const radius = Math.min(Math.max(value, 0) * scale, R);
      const { x, y } = pointAt(i, values.length, radius);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

/** 軸が担当する扇形。ここ全体をホバーの当たり判定にする（値が0でも掴める）。 */
export function wedgePath(index: number, count: number): string {
  const half = Math.PI / count;
  const { angle } = pointAt(index, count, 0);
  const [from, to] = [angle - half, angle + half];
  const p = (a: number) =>
    `${(CX + LABEL_R * Math.cos(a)).toFixed(2)},${(CY + LABEL_R * Math.sin(a)).toFixed(2)}`;
  return `M ${CX},${CY} L ${p(from)} A ${LABEL_R},${LABEL_R} 0 0 1 ${p(to)} Z`;
}

/** 長いラベルは空白で2行に折り返す（軸ラベル同士の衝突を避けるため）。 */
export function wrap(label: string): string[] {
  if (label.length <= 7 || !label.includes(" ")) return [label];
  const words = label.split(" ");
  const middle = Math.ceil(words.length / 2);
  return [words.slice(0, middle).join(" "), words.slice(middle).join(" ")];
}

/** 軸が増えるほどラベル同士の間隔が詰まるので、字を小さくして逃がす。 */
export const labelFontSize = (count: number): number =>
  count >= 12 ? 8.5 : count >= 10 ? 9 : 10;

/** 真上・真下の頂点は中央寄せ、右半分は左寄せ、左半分は右寄せ。 */
export const anchorFor = (x: number): "middle" | "start" | "end" =>
  Math.abs(x - CX) < 2 ? "middle" : x > CX ? "start" : "end";

export const formatValue = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);
