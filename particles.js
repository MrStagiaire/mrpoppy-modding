(() => {
    "use strict";

    function initParticles() {
        // ==================================
        // PARAMÈTRES MODIFIABLES
        // ==================================

        const NOMBRE = 100;
        const DISTANCE = 230;
        const TAILLE = 9;
        const VITESSE = 0.65;
        const RAYON_SOURIS = 250;

        const COULEURS = [
            "#a855f7",
            "#c084fc",
            "#39ff14"
        ];

        // Création de l'arrière-plan

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        canvas.id = "particle-background";

        Object.assign(canvas.style, {
            position: "fixed",
            inset: "0",
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: "-1",
            background: "#08050f"
        });

        document.body.style.isolation = "isolate";
        document.body.style.background = "#08050f";
        document.body.prepend(canvas);

        // Rendre le fond principal transparent

        const style = document.createElement("style");

        style.textContent = `
            .hero {
                background: transparent !important;
            }
        `;

        document.head.appendChild(style);

        let largeur;
        let hauteur;
        let particules = [];

        const souris = {
            x: null,
            y: null
        };

        function redimensionner() {
            largeur = window.innerWidth;
            hauteur = window.innerHeight;

            const ratio = Math.min(
                window.devicePixelRatio || 1, 2
            );

            canvas.width = largeur * ratio;
            canvas.height = hauteur * ratio;

            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

            const nombre = largeur < 768
                ? 45
                : NOMBRE;

            particules = Array.from(
                { length: nombre },
                () => new Particule()
            );
        }

        window.addEventListener(
            "pointermove",
            (e) => {
                souris.x = e.clientX;
                souris.y = e.clientY;
            }
        );

        window.addEventListener("pointerout", (e) => {
            if (!e.relatedTarget) {
                souris.x = null;
                souris.y = null;
            }
        });

        // ==================================
        // FORMES GÉOMÉTRIQUES
        // ==================================

        class Particule {
            constructor() {
                this.x = Math.random() * largeur;
                this.y = Math.random() * hauteur;

                this.vx =
                    (Math.random() - 0.5) * VITESSE;

                this.vy =
                    (Math.random() - 0.5) * VITESSE;

                this.taille =
                    3 + Math.random() * TAILLE;

                this.cotes =
                    3 + Math.floor(Math.random() * 3);

                this.rotation = Math.random() * Math.PI;

                this.couleur = COULEURS[
                    Math.floor(
                        Math.random() * COULEURS.length
                    )
                ];
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.rotation += 0.006;

                // Attraction vers la souris

                if (souris.x !== null) {
                    const dx = souris.x - this.x;
                    const dy = souris.y - this.y;
                    const d = Math.hypot(dx, dy);

                    if (d < RAYON_SOURIS && d > 25) {
                        this.x += dx * 0.004;
                        this.y += dy * 0.004;
                    }
                }

                // Rebond sur les bords

                if (this.x < 0 || this.x > largeur) {
                    this.vx *= -1;
                    this.x = Math.max(
                        0, Math.min(largeur, this.x)
                    );
                }

                if (this.y < 0 || this.y > hauteur) {
                    this.vy *= -1;
                    this.y = Math.max(
                        0, Math.min(hauteur, this.y)
                    );
                }
            }

            draw() {
                ctx.save();

                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);

                ctx.beginPath();

                for (let i = 0; i < this.cotes; i++) {
                    const angle =
                        i * Math.PI * 2 / this.cotes;

                    const x =
                        Math.cos(angle) * this.taille;

                    const y =
                        Math.sin(angle) * this.taille;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                ctx.closePath();

                ctx.strokeStyle = this.couleur;
                ctx.lineWidth = 1.5;
                ctx.shadowColor = this.couleur;
                ctx.shadowBlur = 12;

                ctx.stroke();
                ctx.restore();
            }
        }

        // ==================================
        // TRAITS ENTRE LES PARTICULES
        // ==================================

        function connecter() {
            for (let i = 0; i < particules.length; i++) {
                for (
                    let j = i + 1;
                    j < particules.length;
                    j++
                ) {
                    const a = particules[i];
                    const b = particules[j];

                    const distance = Math.hypot(
                        a.x - b.x,
                        a.y - b.y
                    );

                    if (distance < DISTANCE) {
                        ctx.beginPath();

                        ctx.globalAlpha =
                            (1 - distance / DISTANCE)
                            * 0.55;

                        ctx.strokeStyle = a.couleur;
                        ctx.lineWidth = 1;

                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            ctx.globalAlpha = 1;
        }

        // Traits lumineux vers le curseur

        function connecterSouris() {
            if (souris.x === null) return;

            particules.forEach((p) => {
                const d = Math.hypot(
                    souris.x - p.x,
                    souris.y - p.y
                );

                if (d < RAYON_SOURIS) {
                    ctx.beginPath();

                    ctx.globalAlpha =
                        (1 - d / RAYON_SOURIS) * 0.8;

                    ctx.strokeStyle = "#c084fc";
                    ctx.lineWidth = 1.5;

                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(souris.x, souris.y);
                    ctx.stroke();
                }
            });

            ctx.globalAlpha = 1;
        }

        // ==================================
        // ANIMATION PERMANENTE
        // ==================================

        const mouvementReduit = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        function animer() {
            ctx.clearRect(0, 0, largeur, hauteur);

            particules.forEach((p) => {
                if (!mouvementReduit.matches) {
                    p.update();
                }
            });

            connecter();
            connecterSouris();

            particules.forEach((p) => p.draw());

            requestAnimationFrame(animer);
        }

        window.addEventListener(
            "resize",
            redimensionner
        );

        redimensionner();
        animer();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initParticles
        );
    } else {
        initParticles();
    }
})();
