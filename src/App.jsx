import TopHeader from "@/components/common/TopHeader";
import Hero from "@/components/home/Hero";
import AboutSection from "@/components/home/AboutSection";
import OurServices from "@/components/home/OurServices";
import AvailabilitySection from "@/components/home/AvailabilitySection";
import ClientReviews from "@/components/home/ClientReviews";
import GetInTouch from "@/components/home/GetInTouch";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "@/components/common/Footer";
const App = () => {
  return (
    <>
     <ToastContainer
        position="top-right"
        autoClose={3000}
        closeOnClick
        pauseOnHover
      />
      <TopHeader />
      <Hero />
      <AboutSection />
      <OurServices />
      <AvailabilitySection />
      <ClientReviews />
      <GetInTouch />
      <Footer />
    </>
  );
};

export default App;