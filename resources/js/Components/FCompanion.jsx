import { useEffect, useRef, useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';

const idleMessages = [
    'Unit F-01 dalam mode siaga. Sentuh untuk patroli.',
    'Sistem ronda otomatis siap menerima koordinat.',
    'Sensor termal aktif. Arahkan aku ke titik rawan.',
];

const followMessage = 'Mengunci target... patroli adaptif aktif!';
const clickMessage = 'Perintah diterima. Menyalakan sirene virtual.';

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function createBeep(audioCtxRef) {
    if (typeof window === 'undefined' || !window.AudioContext) return;
    if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(680, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.stop(ctx.currentTime + 0.22);
}

export default function FCompanion() {
    const containerRef = useRef(null);
    const targetRef = useRef({ x: 0, y: 0 });
    const positionRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef(null);
    const idleTimerRef = useRef(null);
    const audioCtxRef = useRef(null);

    const [isPressed, setPressed] = useState(false);
    const [blink, setBlink] = useState(false);
    const [message, setMessage] = useState(idleMessages[0]);
    const [telemetry, setTelemetry] = useState({ x: '000', y: '000', mode: 'IDLE' });

    const cycleIdleMessage = () => {
        clearTimeout(idleTimerRef.current ?? undefined);
        idleTimerRef.current = setTimeout(() => {
            setMessage((prev) => {
                const currentIndex = idleMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % idleMessages.length;
                return idleMessages[nextIndex];
            });
            cycleIdleMessage();
        }, 4500);
    };

    useEffect(() => {
        cycleIdleMessage();
        const blinkInterval = setInterval(() => setBlink((value) => !value), 2600);
        return () => {
            cancelAnimationFrame(rafRef.current ?? undefined);
            clearTimeout(idleTimerRef.current ?? undefined);
            clearInterval(blinkInterval);
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
                audioCtxRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handlePointerMove = (event) => {
            const rect = container.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            const clamped = { x: clamp(x, -0.6, 0.6), y: clamp(y, -0.6, 0.6) };
            targetRef.current = clamped;
            setMessage(followMessage);
            setTelemetry({
                x: (clamped.x * 100).toFixed(0).padStart(3, '0'),
                y: (clamped.y * 100).toFixed(0).padStart(3, '0'),
                mode: isPressed ? 'COMMAND' : 'TRACK',
            });
            cycleIdleMessage();
            if (!rafRef.current) {
                rafRef.current = requestAnimationFrame(updatePosition);
            }
        };

        const handlePointerLeave = () => {
            targetRef.current = { x: 0, y: 0 };
            setPressed(false);
            setMessage(idleMessages[Math.floor(Math.random() * idleMessages.length)]);
            setTelemetry({ x: '000', y: '000', mode: 'IDLE' });
            cycleIdleMessage();
            if (!rafRef.current) {
                rafRef.current = requestAnimationFrame(updatePosition);
            }
        };

        const handlePointerDown = () => {
            setPressed(true);
            setMessage(clickMessage);
            setTelemetry((prev) => ({ ...prev, mode: 'COMMAND' }));
            cycleIdleMessage();
            createBeep(audioCtxRef);
        };

        const handlePointerUp = () => {
            setPressed(false);
            setMessage(followMessage);
            setTelemetry((prev) => ({ ...prev, mode: 'TRACK' }));
            cycleIdleMessage();
        };

        container.addEventListener('pointermove', handlePointerMove);
        container.addEventListener('pointerleave', handlePointerLeave);
        container.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);

        rafRef.current = requestAnimationFrame(updatePosition);

        return () => {
            container.removeEventListener('pointermove', handlePointerMove);
            container.removeEventListener('pointerleave', handlePointerLeave);
            container.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
            cancelAnimationFrame(rafRef.current ?? undefined);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPressed]);

    const updatePosition = () => {
        const current = positionRef.current;
        const target = targetRef.current;
        const damping = 0.16;
        const nextX = current.x + (target.x - current.x) * damping;
        const nextY = current.y + (target.y - current.y) * damping;

        positionRef.current = { x: nextX, y: nextY };

        const mascot = containerRef.current?.querySelector('[data-mascot]');
        const leftEye = containerRef.current?.querySelector('[data-eye="left"]');
        const rightEye = containerRef.current?.querySelector('[data-eye="right"]');
        const antenna = containerRef.current?.querySelector('[data-antenna]');
        const armLeft = containerRef.current?.querySelector('[data-arm="left"]');
        const armRight = containerRef.current?.querySelector('[data-arm="right"]');
        const thrusters = containerRef.current?.querySelectorAll('[data-thruster]');
        const aura = containerRef.current?.querySelector('[data-aura]');

        if (mascot) {
            const tiltX = -nextY * 35;
            const tiltY = nextX * 35;
            const scale = isPressed ? 0.92 : 1;
            mascot.style.transform = `translate3d(${nextX * 60}px, ${nextY * 60}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`;
        }

        const eyeShiftX = clamp(nextX * 16, -12, 12);
        const eyeShiftY = clamp(nextY * 12, -6, 6);
        const eyeScale = blink ? 0.2 : isPressed ? 0.6 : 1;

        if (leftEye) {
            leftEye.style.transform = `translate(${eyeShiftX - 4}px, ${eyeShiftY}px) scale(${eyeScale})`;
        }
        if (rightEye) {
            rightEye.style.transform = `translate(${eyeShiftX + 4}px, ${eyeShiftY}px) scale(${eyeScale})`;
        }

        if (antenna) {
            antenna.style.transform = `translateX(${nextX * 28}px) rotate(${nextX * 15}deg)`;
        }

        if (armLeft) {
            const angle = isPressed ? -50 : -20 + nextY * 18;
            armLeft.style.transform = `translateY(${nextY * 10}px) rotate(${angle}deg)`;
        }
        if (armRight) {
            const angle = isPressed ? 50 : 20 + nextY * 18;
            armRight.style.transform = `translateY(${nextY * 10}px) rotate(${angle}deg)`;
        }

        thrusters?.forEach((thruster, index) => {
            const intensity = isPressed ? 0.9 : 0.5 + Math.sin(performance.now() / 200 + index) * 0.12;
            thruster.style.opacity = `${intensity}`;
        });

        if (aura) {
            aura.style.transform = `translate3d(${nextX * 28}px, ${nextY * 28}px, 0) scale(${isPressed ? 1.2 : 1})`;
            aura.style.opacity = isPressed ? '0.82' : '0.55';
        }

        if (Math.abs(target.x - nextX) > 0.0001 || Math.abs(target.y - nextY) > 0.0001) {
            rafRef.current = requestAnimationFrame(updatePosition);
        } else {
            rafRef.current = null;
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative flex h-[32rem] w-full items-center justify-center overflow-hidden rounded-[3.5rem] border border-white/10 bg-gradient-to-br from-slate-950/60 via-blue-950/40 to-slate-900/60 p-12 text-white shadow-[0_45px_120px_-45px_rgba(10,20,50,0.9)] backdrop-blur-[30px]"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_70%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width=%22220%22 height=%22220%22 viewBox=%220 0 220 220%22%3E%3Cg fill=%22none%22 stroke=%22rgba(94,234,212,0.08)%22 stroke-width=%220.5%22%3E%3Cpath d=%22M0 110h220M110 0v220%22/%3E%3Ccircle cx=%22110%22 cy=%22110%22 r=%2250%22/%3E%3C/g%3E%3C/svg%3E')]" />

            <div
                data-aura
                className="pointer-events-none absolute h-[25rem] w-[25rem] rounded-[3.8rem] bg-[conic-gradient(from_120deg_at_50%_50%,rgba(56,189,248,0.5),rgba(59,130,246,0.05),rgba(168,85,247,0.4))] blur-3xl transition-transform duration-300"
            />

            <div className="absolute left-8 top-8 w-60 rounded-2xl border border-cyan-400/20 bg-white/5 p-4 text-xs font-mono text-cyan-100/80 shadow-[0_25px_60px_-40px_rgba(56,189,248,0.7)]">
                <div className="flex items-center justify-between text-[0.55rem] uppercase tracking-[0.35em] text-cyan-300/80">
                    <span>F-01</span>
                    <span>Telemetry</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                        <p className="text-[0.55rem] text-cyan-200/60">Axis-X</p>
                        <p className="font-semibold text-cyan-100">{telemetry.x}</p>
                    </div>
                    <div>
                        <p className="text-[0.55rem] text-cyan-200/60">Axis-Y</p>
                        <p className="font-semibold text-cyan-100">{telemetry.y}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-[0.55rem] text-cyan-200/60">Mode</p>
                        <p className="font-semibold text-cyan-100">{telemetry.mode}</p>
                    </div>
                </div>
                <div className="mt-3 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                <div className="mt-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-lime-400/90 animate-pulse" />
                    <span className="text-[0.55rem] tracking-[0.3em] text-lime-200/70">Online</span>
                </div>
            </div>

            <div
                data-mascot
                className="relative flex h-[20rem] w-[15rem] flex-col items-center justify-start rounded-[3rem] border border-white/25 bg-gradient-to-br from-white/12 via-white/6 to-white/16 shadow-[0_40px_120px_-50px_rgba(56,189,248,0.95)] transition-transform duration-200"
            >
                <div data-antenna className="absolute -top-12 flex h-12 items-end">
                    <div className="mx-auto h-12 w-[6px] rounded-full bg-gradient-to-b from-cyan-300 via-blue-400 to-transparent" />
                    <div className="absolute -top-4 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-300 to-indigo-500 shadow-[0_18px_36px_-18px_rgba(56,189,248,0.8)]" />
                </div>

                <div className="relative mt-6 flex h-28 w-32 items-center justify-center rounded-[2.2rem] border border-white/25 bg-[#061229]/95 shadow-[0_30px_70px_-40px_rgba(14,165,233,0.75)]">
                    <div data-eye="left" className="h-6 w-6 rounded-full bg-gradient-to-br from-sky-200 to-white shadow-[0_0_25px_rgba(144,205,244,0.9)]" />
                    <div className="mx-2 h-8 w-[3px] rounded-full bg-white/20" />
                    <div data-eye="right" className="h-6 w-6 rounded-full bg-gradient-to-br from-sky-200 to-white shadow-[0_0_25px_rgba(144,205,244,0.9)]" />
                    <div className="absolute bottom-4 h-[3px] w-20 rounded-full bg-gradient-to-r from-cyan-200 via-white/40 to-cyan-200" />
                </div>

                <div className="relative mt-5 flex h-40 w-36 items-center justify-center rounded-[2.6rem] border border-white/18 bg-white/10 shadow-[0_35px_90px_-42px_rgba(59,130,246,0.85)] backdrop-blur-xl">
                    <div className="absolute inset-x-8 top-5 h-2 rounded-full bg-gradient-to-r from-cyan-200/70 via-white/20 to-cyan-200/70" />
                    <ApplicationLogo className="h-[4.5rem] w-auto drop-shadow-[0_28px_55px_rgba(56,189,248,0.8)]" alt="F-Guardian" />
                    <div className="absolute bottom-6 flex gap-2">
                        <span className="h-6 w-1 rounded-full bg-cyan-300/70" />
                        <span className="h-6 w-1 rounded-full bg-cyan-300/50" />
                        <span className="h-6 w-1 rounded-full bg-cyan-300/70" />
                    </div>
                </div>

                <div className="absolute left-[-2.8rem] top-36 flex h-[5.5rem] w-5 items-center" data-arm="left">
                    <div className="h-full w-full origin-top rounded-full bg-gradient-to-b from-white/60 via-white/25 to-white/5" />
                    <div className="absolute bottom-0 left-1/2 h-7 w-7 -translate-x-1/2 rounded-full bg-gradient-to-tr from-cyan-300 to-indigo-500" />
                </div>
                <div className="absolute right-[-2.8rem] top-36 flex h-[5.5rem] w-5 items-center" data-arm="right">
                    <div className="h-full w-full origin-top rounded-full bg-gradient-to-b from-white/60 via-white/25 to-white/5" />
                    <div className="absolute bottom-0 left-1/2 h-7 w-7 -translate-x-1/2 rounded-full bg-gradient-to-tr from-cyan-300 to-indigo-500" />
                </div>

                <div className="absolute bottom-6 flex w-full items-end justify-around px-6">
                    <div className="relative h-12 w-6 rounded-full bg-gradient-to-b from-white/60 via-white/20 to-transparent">
                        <div data-thruster className="absolute inset-x-1 bottom-[-10px] h-8 rounded-full bg-gradient-to-b from-sky-300/80 via-sky-400/60 to-transparent blur-md" />
                    </div>
                    <div className="relative h-12 w-6 rounded-full bg-gradient-to-b from-white/60 via-white/20 to-transparent">
                        <div data-thruster className="absolute inset-x-1 bottom-[-10px] h-8 rounded-full bg-gradient-to-b from-sky-300/80 via-sky-400/60 to-transparent blur-md" />
                    </div>
                </div>
            </div>

            <div className="pointer-events-none absolute bottom-8 left-1/2 w-[90%] max-w-lg -translate-x-1/2 rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-sm font-medium text-white/90 shadow-[0_20px_55px_-35px_rgba(37,99,235,0.75)] backdrop-blur-xl">
                {message}
            </div>
        </div>
    );
}

