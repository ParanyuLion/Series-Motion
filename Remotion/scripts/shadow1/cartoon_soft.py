# A softer, more photographic backdrop for the dorm series: the same crop and cold grade as cartoon.py, but only a light colour flattening and a faint ink edge, so the picture stays readable.
# usage: python scripts/shadow1/cartoon_soft.py SRC OUT CX [cold] [CY]
import sys, cv2, numpy as np
src, out, cx = sys.argv[1], sys.argv[2], float(sys.argv[3])
cold = len(sys.argv) > 4 and sys.argv[4] == "cold"
cy = float(sys.argv[5]) if len(sys.argv) > 5 else 0.5
im = cv2.imread(src); h, w = im.shape[:2]
cw = int(h * 1080 / 1250)
if cw > w:
    ch = int(w * 1250 / 1080); y0 = int(min(max(h * cy - ch / 2, 0), h - ch)); im = im[y0:y0 + ch]; h = ch; cw = w
x0 = int(min(max(w * cx - cw / 2, 0), w - cw))
im = cv2.resize(im[:, x0:x0 + cw], (1080, 1250), interpolation=cv2.INTER_AREA)
f0 = np.clip((im.astype(np.float32) / 255) ** (0.55 if cold else 0.65) * 1.05, 0, 1); im2 = (f0 * 255).astype(np.uint8)
s = im2.copy()
for _ in range(2): s = cv2.bilateralFilter(s, 9, 40, 9)
m = cv2.pyrMeanShiftFiltering(s, 8, 20)
Z = m.reshape(-1, 3).astype(np.float32)
_, lab, cen = cv2.kmeans(Z, 32, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0), 2, cv2.KMEANS_PP_CENTERS)
q = cv2.medianBlur(cen[lab.flatten()].reshape(m.shape).astype(np.uint8), 3)
f = q.astype(np.float32) / 255
lum = (0.114 * f[..., 0] + 0.587 * f[..., 1] + 0.299 * f[..., 2])[..., None]
if cold:
    f = lum + (f - lum) * 0.5; f = f * np.array([1.08, 0.97, 0.84]); f = np.clip((f - 0.5) * 1.15 + 0.4, 0, 1)
else:
    f = lum + (f - lum) * 0.8; f = f * np.array([0.84, 0.92, 1.0]); f = np.clip((f - 0.5) * 1.15 + 0.42, 0, 1)
g = cv2.GaussianBlur(cv2.cvtColor(s, cv2.COLOR_BGR2GRAY), (0, 0), 1.6)
e = cv2.Canny(g, 30, 80); e = cv2.dilate(e, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2)))
a = (e.astype(np.float32) / 255)[..., None] * 0.4
o = f * (1 - a) + np.array([0.05, 0.07, 0.1]) * a
cv2.imwrite(out, (np.clip(o, 0, 1) * 255).astype(np.uint8))
row = o[-30:].reshape(-1, 3).mean(0)[::-1] * 255
print(out, "edge #%02x%02x%02x" % tuple(int(v) for v in row))
