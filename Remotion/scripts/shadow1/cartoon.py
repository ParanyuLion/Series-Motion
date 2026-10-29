# Cartoonise a photo for the shadowless-village backdrops: 1080x1250 vertical crop, flat colours (k-means), wobbling ink edge, warm-desaturated grade.
# usage: python scripts/shadow1/cartoon.py SRC OUT CX [cold]
import sys, cv2, numpy as np
src, out, cx = sys.argv[1], sys.argv[2], float(sys.argv[3])
cold = len(sys.argv) > 4 and sys.argv[4] == "cold"
im = cv2.imread(src); h, w = im.shape[:2]
cw = int(h * 1080 / 1250)
if cw > w:
    ch = int(w * 1250 / 1080); y0 = (h - ch) // 2; im = im[y0:y0 + ch]; h = ch; cw = w
x0 = int(min(max(w * cx - cw / 2, 0), w - cw))
im = cv2.resize(im[:, x0:x0 + cw], (1080, 1250), interpolation=cv2.INTER_AREA)
f0 = np.clip((im.astype(np.float32) / 255) ** (0.5 if cold else 0.62) * 1.05, 0, 1); im2 = (f0 * 255).astype(np.uint8)
s = im2.copy()
for _ in range(3): s = cv2.bilateralFilter(s, 11, 55, 11)
m = cv2.pyrMeanShiftFiltering(s, 15, 32)
Z = m.reshape(-1, 3).astype(np.float32)
_, lab, cen = cv2.kmeans(Z, 14, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 1.0), 3, cv2.KMEANS_PP_CENTERS)
q = cv2.medianBlur(cen[lab.flatten()].reshape(m.shape).astype(np.uint8), 5)
f = q.astype(np.float32) / 255
lum = (0.114 * f[..., 0] + 0.587 * f[..., 1] + 0.299 * f[..., 2])[..., None]
if cold:
    f = lum + (f - lum) * 0.35; f = f * np.array([1.1, 0.95, 0.78]); f = np.clip((f - 0.5) * 1.25 + 0.36, 0, 1)
else:
    f = lum + (f - lum) * 0.9; f = f * np.array([0.78, 0.9, 1.02]); f = np.clip((f - 0.5) * 1.3 + 0.4, 0, 1)
g = cv2.GaussianBlur(cv2.cvtColor(s, cv2.COLOR_BGR2GRAY), (0, 0), 1.2)
e = cv2.Canny(g, 22, 60); e = cv2.dilate(e, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
rng = np.random.default_rng(5)
dx = cv2.GaussianBlur(rng.normal(0, 1, e.shape).astype(np.float32), (0, 0), 8) * 34
dy = cv2.GaussianBlur(rng.normal(0, 1, e.shape).astype(np.float32), (0, 0), 8) * 34
X, Y = np.meshgrid(np.arange(1080), np.arange(1250))
e = cv2.remap(e, (X + dx).astype(np.float32), (Y + dy).astype(np.float32), cv2.INTER_LINEAR)
a = (e.astype(np.float32) / 255)[..., None] * 0.9
o = f * (1 - a) + np.array([0.04, 0.07, 0.1]) * a
o = o * (1 - 0.12 * np.linspace(0, 1, 1250)[:, None, None])
n = cv2.GaussianBlur(rng.normal(0, 1, (1250, 1080)).astype(np.float32), (0, 0), 2.2)
o = np.clip(o * (1 + 0.04 * n[..., None]), 0, 1)
cv2.imwrite(out, (o * 255).astype(np.uint8))
row = o[-30:].reshape(-1, 3).mean(0)[::-1] * 255
print(out, "edge #%02x%02x%02x" % tuple(int(v) for v in row))
