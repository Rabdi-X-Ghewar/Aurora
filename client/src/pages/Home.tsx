

import ExploreSection from "../components/ExploreSection";
import Features from "../components/Features";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";


const Home = () => {
  return (
    <div>
      <Navbar />
      <main>
        <ExploreSection />
        <Features />
        <Footer />
      </main>
    </div>
  );
};

export default Home;