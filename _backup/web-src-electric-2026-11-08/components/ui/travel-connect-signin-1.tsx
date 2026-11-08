import React, { useRef, useEffect, useState } from "react";
import { Eye, EyeOff, ArrowRight, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/constants";

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
	variant?: "default" | "outline";
	className?: string;
}

const Button = ({
	children,
	variant = "default",
	className = "",
	...props
}: ButtonProps) => {
	const baseStyles =
		"inline-flex items-center justify-center whitespace-nowrap rounded-[14px] text-[16px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer h-[56px]";

	const variantStyles = {
		default:
			"bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white hover:from-[#2563EB] hover:to-[#4F46E5] hover:brightness-110 hover:shadow-lg hover:shadow-blue-300/40",
		outline:
			"border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
	};

	return (
		<button
			className={`${baseStyles} ${variantStyles[variant]} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	className?: string;
}

const Input = ({ className = "", ...props }: InputProps) => {
	return (
		<input
			className={`flex h-[54px] w-full rounded-[12px] border border-slate-200 bg-white px-4 py-3 text-[16px] text-gray-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-slate-300 shadow-sm ${className}`}
			{...props}
		/>
	);
};

type RoutePoint = {
	x: number;
	y: number;
	delay: number;
};

const DotMap = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	const routes: { start: RoutePoint; end: RoutePoint; color: string }[] = [
		{
			start: { x: 100, y: 150, delay: 0 },
			end: { x: 200, y: 80, delay: 2 },
			color: "#2563eb",
		},
		{
			start: { x: 200, y: 80, delay: 2 },
			end: { x: 260, y: 120, delay: 4 },
			color: "#2563eb",
		},
		{
			start: { x: 50, y: 50, delay: 1 },
			end: { x: 150, y: 180, delay: 3 },
			color: "#2563eb",
		},
		{
			start: { x: 280, y: 60, delay: 0.5 },
			end: { x: 180, y: 180, delay: 2.5 },
			color: "#2563eb",
		},
	];

	const generateDots = (width: number, height: number) => {
		const dots = [];
		const gap = 12;

		for (let x = 0; x < width; x += gap) {
			for (let y = 0; y < height; y += gap) {
				const isInMapShape =
					((x < width * 0.25 && x > width * 0.05) && (y < height * 0.4 && y > height * 0.1)) ||
					((x < width * 0.25 && x > width * 0.15) && (y < height * 0.8 && y > height * 0.4)) ||
					((x < width * 0.45 && x > width * 0.3) && (y < height * 0.35 && y > height * 0.15)) ||
					((x < width * 0.5 && x > width * 0.35) && (y < height * 0.65 && y > height * 0.35)) ||
					((x < width * 0.7 && x > width * 0.45) && (y < height * 0.5 && y > height * 0.1)) ||
					((x < width * 0.8 && x > width * 0.65) && (y < height * 0.8 && y > height * 0.6));

				if (isInMapShape && Math.random() > 0.3) {
					dots.push({
						x,
						y,
						radius: 1,
						opacity: Math.random() * 0.5 + 0.2,
					});
				}
			}
		}
		return dots;
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const resizeObserver = new ResizeObserver(entries => {
			const { width, height } = entries[0].contentRect;
			setDimensions({ width, height });
			canvas.width = width;
			canvas.height = height;
		});

		resizeObserver.observe(canvas.parentElement as Element);
		return () => resizeObserver.disconnect();
	}, []);

	useEffect(() => {
		if (!dimensions.width || !dimensions.height) return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dots = generateDots(dimensions.width, dimensions.height);
		let animationFrameId: number;
		let startTime = Date.now();

		function drawDots() {
			if (!ctx) return;
			ctx.clearRect(0, 0, dimensions.width, dimensions.height);
			dots.forEach(dot => {
				ctx.beginPath();
				ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(37, 99, 235, ${dot.opacity})`;
				ctx.fill();
			});
		}

		function drawRoutes() {
			if (!ctx) return;
			const currentTime = (Date.now() - startTime) / 1000;

			routes.forEach(route => {
				const elapsed = currentTime - route.start.delay;
				if (elapsed <= 0) return;

				const duration = 3;
				const progress = Math.min(elapsed / duration, 1);

				const x = route.start.x + (route.end.x - route.start.x) * progress;
				const y = route.start.y + (route.end.y - route.start.y) * progress;

				ctx.beginPath();
				ctx.moveTo(route.start.x, route.start.y);
				ctx.lineTo(x, y);
				ctx.strokeStyle = route.color;
				ctx.lineWidth = 1.5;
				ctx.stroke();

				ctx.beginPath();
				ctx.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
				ctx.fillStyle = route.color;
				ctx.fill();

				ctx.beginPath();
				ctx.arc(x, y, 3, 0, Math.PI * 2);
				ctx.fillStyle = "#3b82f6";
				ctx.fill();

				ctx.beginPath();
				ctx.arc(x, y, 6, 0, Math.PI * 2);
				ctx.fillStyle = "rgba(59, 130, 246, 0.4)";
				ctx.fill();

				if (progress === 1) {
					ctx.beginPath();
					ctx.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
					ctx.fillStyle = route.color;
					ctx.fill();
				}
			});
		}

		function animate() {
			drawDots();
			drawRoutes();

			const currentTime = (Date.now() - startTime) / 1000;
			if (currentTime > 15) {
				startTime = Date.now();
			}

			animationFrameId = requestAnimationFrame(animate);
		}

		animate();

		return () => cancelAnimationFrame(animationFrameId);
	}, [dimensions]);

	return (
		<div className="relative w-full h-full overflow-hidden">
			<canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
		</div>
	);
};

const FloatingCircle = ({
	size,
	top,
	left,
	delay,
}: {
	size: number;
	top: string;
	left: string;
	delay: number;
}) => (
	<motion.div
		initial={{ opacity: 0, scale: 0 }}
		animate={{ opacity: 1, scale: 1 }}
		transition={{ delay, duration: 1, ease: "easeOut" }}
		className="absolute rounded-full bg-blue-200/30"
		style={{
			width: size,
			height: size,
			top,
			left,
			transform: "translate(-50%, -50%)",
		}}
	/>
);

const FloatingParticles = () => {
	const particles = Array.from({ length: 8 });
	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
			{particles.map((_, i) => {
				const size = Math.random() * 3 + 2;
				const left = `${Math.random() * 100}%`;
				const delay = Math.random() * 5;
				const duration = Math.random() * 5 + 5;
				return (
					<motion.div
						key={i}
						initial={{ y: "110%", opacity: 0 }}
						animate={{
							y: "-10%",
							opacity: [0, 0.4, 0.4, 0],
							x: ["0px", `${(Math.random() - 0.5) * 30}px`, "0px"]
						}}
						transition={{
							duration,
							delay,
							repeat: Infinity,
							ease: "linear",
						}}
						className="absolute rounded-full bg-blue-400"
						style={{
							width: size,
							height: size,
							left,
							bottom: 0,
						}}
					/>
				);
			})}
		</div>
	);
};

interface SignInCardProps {
	mode: "login" | "register";
}

const SignInCard = ({ mode }: SignInCardProps) => {
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [email, setEmail] = useState("");
	const [fullName, setFullName] = useState("");
	const [password, setPassword] = useState("");
	const [isHovered, setIsHovered] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const title = mode === "login" ? "Welcome back" : "Create account";
	const subtitle = mode === "login" ? "Sign in to your account" : "Register for a new account";
	const buttonText = mode === "login" ? "Sign in" : "Create account";
	const altText = mode === "login" ? "Don't have an account?" : "Already have an account?";
	const altLink = mode === "login" ? "Register" : "Sign in";
	const altHref = mode === "login" ? "/auth/register" : "/auth/login";

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !password) {
			toast.error("Please fill in all fields.");
			return;
		}

		if (mode === "register" && !fullName) {
			toast.error("Please enter your full name.");
			return;
		}

		setIsLoading(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			if (mode === "login") {
				const id = email.trim().toLowerCase();
				if (id === "614463895" && password === "123456") {
					toast.success("Welcome, System Owner!");
					router.push(ROUTES.DASHBOARD.SUPER_ADMIN);
				} else if (
					(id === "owner@beco.so" || id === "614500001" || id === "614500001@beco.so") &&
					password === "123456"
				) {
					toast.success("Welcome, Company Owner!");
					router.push(ROUTES.DASHBOARD.COMPANY_OWNER);
				} else {
					toast.success("Successfully logged in!");
					router.push(ROUTES.DASHBOARD.CUSTOMER);
				}
			} else {
				// Register Flow Simulation
				toast.success("Account created successfully!");
				router.push(ROUTES.AUTH.LOGIN);
			}
		} catch {
			toast.error("Authentication failed. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex w-full h-full items-center justify-center relative z-10">
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.25, ease: "easeOut" }}
				className="w-full max-w-[960px] h-[640px] md:h-[640px] overflow-hidden rounded-[24px] flex flex-col md:flex-row bg-white shadow-[0_4px_40px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]"
			>
				{/* Left side - Illustration */}
				<div className="hidden md:flex w-full md:w-[40%] lg:w-[40%] relative overflow-hidden items-center justify-center bg-gradient-to-b from-[#EEF4FF] to-[#DCEBFF]">
					<DotMap />
					<FloatingParticles />

					<FloatingCircle size={80} top="15%" left="20%" delay={0.2} />
					<FloatingCircle size={50} top="85%" left="80%" delay={0.4} />
					<FloatingCircle size={30} top="25%" left="75%" delay={0.6} />
					<FloatingCircle size={60} top="70%" left="15%" delay={0.3} />

					<div className="absolute inset-0 flex flex-col items-center justify-center px-8 z-10">
						<motion.div
							initial={{ opacity: 0, y: -16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3, duration: 0.4 }}
							className="mb-6"
						>
							<div className="relative">
								<motion.div
									animate={{ scale: [1, 1.15, 1] }}
									transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
									className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-md scale-110"
								/>
								<div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
									<Zap className="text-white h-10 w-10" />
								</div>
							</div>
						</motion.div>
						<motion.h2
							initial={{ opacity: 0, y: -16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4, duration: 0.4 }}
							className="text-[22px] font-bold text-gray-900 text-center mb-3"
						>
							Soomaali Electric
						</motion.h2>
						<motion.p
							initial={{ opacity: 0, y: -16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5, duration: 0.4 }}
							className="text-[14px] text-gray-500 text-center leading-relaxed max-w-[220px]"
						>
							{mode === "login"
								? "Sign in to manage your electricity usage, track bills, and stay connected"
								: "Create your account to start managing your electricity usage quickly and securely."}
						</motion.p>
					</div>
				</div>

				{/* Right side - Form */}
				<div className="w-full md:w-[60%] lg:w-[60%] px-10 py-8 flex flex-col justify-center bg-white overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.1 }}
						className="w-full max-w-[400px] mx-auto md:mx-0"
					>
						<h1 className="text-[38px] font-bold text-gray-900 leading-tight mb-1">
							{title}
						</h1>
						<p className="text-[18px] text-gray-500 mb-7">
							{subtitle}
						</p>

						{mode === "login" && (
							<>
								<motion.button
									whileHover={{ scale: 1.01, backgroundColor: "#f8fafc" }}
									whileTap={{ scale: 0.99 }}
									disabled={isLoading}
									className="w-full flex items-center justify-center gap-2.5 bg-white border border-slate-200 rounded-[14px] h-[54px] transition-all text-slate-700 text-[16px] font-medium shadow-sm hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
									onClick={() => console.log("Google sign-in")}
								>
									<svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
										<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
										<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
										<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
										<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
									</svg>
									<span>Login with Google</span>
								</motion.button>

								<div className="relative my-6">
									<div className="absolute inset-0 flex items-center">
										<div className="w-full border-t border-slate-100" />
									</div>
									<div className="relative flex justify-center text-sm">
										<span className="px-3 bg-white text-slate-400 font-medium">or</span>
									</div>
								</div>
							</>
						)}

						<form onSubmit={handleFormSubmit} className="flex flex-col">
							{mode === "register" && (
								<div className="mb-5">
									<label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
										Full Name <span className="text-blue-500">*</span>
									</label>
									<Input
										id="fullName"
										type="text"
										value={fullName}
										onChange={(e) => setFullName(e.target.value)}
										placeholder="Enter your full name"
										required
										disabled={isLoading}
									/>
								</div>
							)}

							<div className="mb-5">
								<label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
									Email address / Phone number <span className="text-blue-500">*</span>
								</label>
								<Input
									id="email"
									type="text"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Enter your email or phone number"
									required
									disabled={isLoading}
								/>
							</div>

							<div className="mb-7">
								<label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
									Password <span className="text-blue-500">*</span>
								</label>
								<div className="relative">
									<Input
										id="password"
										type={isPasswordVisible ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="Enter your password"
										required
										className="pr-12"
										disabled={isLoading}
									/>
									<button
										type="button"
										className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-400 hover:text-gray-600 transition-colors"
										onClick={() => setIsPasswordVisible(!isPasswordVisible)}
										tabIndex={-1}
										disabled={isLoading}
									>
										{isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
									</button>
								</div>
							</div>

							{mode === "login" && (
								<div className="flex justify-end -mt-5 mb-5">
									<a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
										Forgot password?
									</a>
								</div>
							)}

							<motion.div
								whileHover={isLoading ? {} : { scale: 1.02 }}
								whileTap={isLoading ? {} : { scale: 0.98 }}
								onHoverStart={() => !isLoading && setIsHovered(true)}
								onHoverEnd={() => setIsHovered(false)}
								className="mb-6"
							>
								<Button
									type="submit"
									disabled={isLoading}
									className={cn(
										"w-full relative overflow-hidden",
										isHovered && !isLoading ? "shadow-xl shadow-blue-300/40" : ""
									)}
								>
									<span className="flex items-center justify-center gap-2">
										{isLoading ? (
											<Loader2 className="h-5 w-5 animate-spin" />
										) : (
											<>
												{buttonText}
												<ArrowRight className="h-4 w-4" />
											</>
										)}
									</span>
									{isHovered && !isLoading && (
										<motion.span
											initial={{ left: "-100%" }}
											animate={{ left: "100%" }}
											transition={{ duration: 1, ease: "easeInOut" }}
											className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/25 to-transparent"
											style={{ filter: "blur(8px)" }}
										/>
									)}
								</Button>
							</motion.div>

							<div className="text-center">
								<p className="text-[15px] text-gray-500">
									{altText}{" "}
									<a href={altHref} className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
										{altLink}
									</a>
								</p>
							</div>
						</form>
					</motion.div>
				</div>
			</motion.div>
		</div>
	);
};

const BackgroundAnimation = () => {
	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
			{/* Ambient moving gradient blobs */}
			<motion.div
				animate={{
					x: [0, 80, -40, 0],
					y: [0, -60, 50, 0],
					scale: [1, 1.15, 0.9, 1],
				}}
				transition={{
					duration: 22,
					repeat: Infinity,
					ease: "easeInOut",
				}}
				className="absolute -top-[20%] -left-[10%] w-[55%] h-[55%] rounded-full bg-blue-500/10 blur-[130px]"
			/>
			<motion.div
				animate={{
					x: [0, -100, 60, 0],
					y: [0, 80, -70, 0],
					scale: [1, 0.95, 1.1, 1],
				}}
				transition={{
					duration: 26,
					repeat: Infinity,
					ease: "easeInOut",
				}}
				className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[140px]"
			/>
			<motion.div
				animate={{
					x: [0, 50, -50, 0],
					y: [0, 60, -60, 0],
				}}
				transition={{
					duration: 18,
					repeat: Infinity,
					ease: "easeInOut",
				}}
				className="absolute top-[35%] left-[25%] w-[35%] h-[35%] rounded-full bg-sky-400/10 blur-[110px]"
			/>

			{/* Soft Fine Grid Background */}
			<div 
				className="absolute inset-0 opacity-[0.4]"
				style={{
					backgroundImage: `radial-gradient(#dbeafe 1.2px, transparent 1.2px)`,
					backgroundSize: '24px 24px'
				}}
			/>
		</div>
	);
};

interface IndexProps {
	mode?: "login" | "register";
}

const Index = ({ mode = "login" }: IndexProps) => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className="font-['Inter',system-ui,sans-serif] min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-4 md:p-8 relative overflow-hidden"
		>
			<BackgroundAnimation />
			<SignInCard mode={mode} />
		</motion.div>
	);
};

export default Index;
