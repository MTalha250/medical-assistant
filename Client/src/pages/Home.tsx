import { Outlet } from "react-router-dom";
import gif from "@/assets/gif.mp4";

const Home = () => {
  return (
    <div className="p-4 md:p-8 w-full h-svh bg-skyBlue/10">
      <div className="overflow-hidden w-full flex h-full shadow-lg">
        <div className="px-8 hidden md:flex flex-col justify-center space-y-10 items-center h-full w-1/2 bg-slate border-r border-slate/20">
          <h1 className="font-bold text-4xl text-white">
            AI Medical Assistant
          </h1>

          <div className="relative rounded-xl overflow-hidden border-4 border-peach shadow-lg">
            <video src={gif} autoPlay loop muted className="w-56" />
          </div>

          <p className="font-light text-white/90 text-center max-w-md">
            An AI assistant that provides everything you need to know about
            medical information. It is not a substitute for professional medical
            advice, diagnosis, or treatment. Always consult with a qualified
            healthcare provider for medical concerns.
          </p>

          <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-peach/20 blur-2xl"></div>
          <div className="absolute top-20 right-20 w-24 h-24 rounded-full bg-mint/20 blur-xl"></div>
        </div>
        <div className="w-full md:w-1/2 bg-white">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Home;
