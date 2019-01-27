import React, { Component } from 'react';
import './App.css';
import backgroundImage from './background-image.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowRight, faWindowClose } from '@fortawesome/free-solid-svg-icons';
 
const CLIENT_ID = '20b7c6eabf6e79850e6963a68c878d08ce08faeb26a22ea37d5b1ad2791688f5';

class Main extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: '',
      img: [],
      imgInfo: [],
      plantInfo: [],
      togglePlantInfo: false,
      toggleSideBar: true,
      togglePicInfo: false
    }
  }

  populateImages = (data) => {
    this.setState({img: []});

    data.results.map(val => {
      return (
        this.setState({
          img: [...this.state.img, val.urls.regular],
          imgInfo: [...this.state.imgInfo ,val.user]
        })
      );
    });
  }

  handleSubmit = async e => {
    e.preventDefault();

    let searchTerm = this.state.value.toLowerCase();

    try {
      let plantURI = `https://plantsdb.xyz/search?Common_Name=${searchTerm}&fields=Family,Genus,Kingdom,Symbol,State_and_Province`;
      let encodedPlantURI = encodeURI(plantURI);
      console.log(encodedPlantURI);

      let [plantReq, picReq, wikiReq] = await 
      Promise.all([
        fetch(encodedPlantURI),
        fetch(`https://api.unsplash.com/search/photos?query=${searchTerm}&per_page=8`, {
        headers: {'Content-Type': 'application/json', 'Authorization': ` Client-ID ${CLIENT_ID}`}
      }),
        fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=&list=search&srlimit=1&utf8=1&srsearch=${searchTerm}`)
      ]);

      let [plantRes, picRes, wikiRes] = await 
      Promise.all([
        plantReq.json(),
        picReq.json(),
        wikiReq.json()
      ]);

      this.populateImages(picRes);

      this.setState({
        plantInfo: plantRes.data[0],
        togglePicInfo: true
      });

      console.log(wikiRes.query.search[0]);

    } catch(err) {
      console.log(err.message);

      this.setState({
        plantInfo: ''
      });
    }
  }

  togglePlantInfo = () => {
    this.setState({
      togglePlantInfo: !this.state.togglePlantInfo,
      toggleSideBar: !this.state.toggleSideBar
    });
  }

  render() {
    const styles = {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: '100% 100%'
    }

    return (
      <div className="App" style={styles}>
        <form className='searchBar' onSubmit={this.handleSubmit}>
          <input className='search' 
                 type='text' 
                 placeholder='Search'
                 autoFocus 
                 onChange={e => this.setState({value: e.target.value})}
                 />
        </form>
        {
          this.state.togglePicInfo && (
            this.state.toggleSideBar && (
              <span className='sideBtn' onClick={this.togglePlantInfo}>
                <FontAwesomeIcon className='arrow' icon={faArrowRight} />
              </span>
            )
          )
        }
        {
          this.state.togglePlantInfo && (
            <div className='plantContainer'>
              <FontAwesomeIcon className='closeBtn' onClick={this.togglePlantInfo} icon={faWindowClose} />
              <div className='plantInfo'>
                <p>Family: {this.state.plantInfo.Family}</p>
                <p>Genus: {this.state.plantInfo.Genus}</p>
                <p>Kingdom: {this.state.plantInfo.Kingdom}</p>
                <p>States: {this.state.plantInfo.State_and_Province}</p>
            </div>
            </div>
          )
        }

        {
          this.state.img.map((img,i) => {
            return(
              <img key={i} className={`image${i+1}`} src={img} alt='Searched Item' />
            )
          })
        }

        {
          this.state.togglePicInfo && (
            <div className='picInfo'>
              Click Here For Photo Credits From Unsplash
            </div>
          )
        }
      </div>
    );
  }
}

export default Main;
