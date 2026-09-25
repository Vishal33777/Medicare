import Banner from "../components/Banner";
import Certification from "../components/Certification";
import Footer from "../components/Footer";
import HomeDoctors from "../components/HomeDoctors";
import Navbar from "../components/Navbar";
import Testimonial from "../components/Testimonial";

function Home() {
  return (
    <div>
      <Navbar />
      <Banner />
      <Certification />
      <HomeDoctors />
      <Testimonial />
      <Footer />
    </div>
  );
}

export default Home;
