# URL volume patch

Changed file:
- site/app.js

Adds URL volume control.

Examples:
- https://overlay.djmixhub.com/top?volume=0.20
- https://overlay.djmixhub.com/bottom?volume=0.50
- https://overlay.djmixhub.com/?position=top&volume=75
- https://overlay.djmixhub.com?volume=0

Supported volume values:
- 0.20 = 20%
- 0.50 = 50%
- 1.0 = 100%
- 20 = 20%
- 75 = 75%
- 0 = silent/muted
