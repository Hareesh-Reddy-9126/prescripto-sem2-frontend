import Header from '@prescripto/shared/components/Header'
import SpecialityMenu from '@prescripto/shared/components/SpecialityMenu'
import TopDoctors from '@prescripto/shared/components/TopDoctors'
import Banner from '@prescripto/shared/components/Banner'

const Home = () => {
  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  )
}

export default Home