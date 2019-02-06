import React, { Component } from 'react';
import './App.css';
import backgroundImage from './background-image.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faWindowClose } from '@fortawesome/free-solid-svg-icons';

require('dotenv').config({path: '../src/.env'});
 
const CLIENT_ID = process.env.REACT_APP_API_KEY;

class Main extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: '',
      imgInfo: [],
      plantInfo: [],
      togglePlantInfo: false,
      toggleSideBar: true,
      togglePicInfo: false,
      toggleSnackbar: false
    }
  }

  populateImages = (data) => {
    this.setState({imgInfo: []});

    data.results.map(val => {
      return (
        this.setState({
          imgInfo: [...this.state.imgInfo ,val]
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

      let [plantReq, picReq] = await 
      Promise.all([
        fetch(encodedPlantURI),
        fetch(`https://api.unsplash.com/search/photos?query=${searchTerm}&per_page=8`, {
        headers: {'Content-Type': 'application/json', 'Authorization': ` Client-ID ${CLIENT_ID}`}
      })]);

      let [plantRes, picRes] = await 
      Promise.all([
        plantReq.json(),
        picReq.json()
      ]);

      this.populateImages(picRes);


      this.setState({
        plantInfo: plantRes.data[0],
        togglePicInfo: true
      });

    } catch(err) {
      this.setState({
        plantInfo: '',
        imgInfo: [],
        toggleSnackbar: !this.state.toggleSnackbar
      });

      setTimeout(() => {
        this.setState({
          toggleSnackbar: !this.state.toggleSnackbar
        })
      },2000);
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
          this.state.imgInfo.map((img,i) => {
            return(
              <a key={i} className={`image${i+1}`} href={img.user.links.html} target='_blank' rel="noopener noreferrer">
                <img key={i}  src={img.urls.regular} alt='' />
                <p className='imgName'>{img.user.name}</p>
              </a>
            )
          })
        }

        {
          this.state.toggleSnackbar && (
            <div className='snackbar'>
              Please Enter A Correct Plant Name
            </div>
          )
        }
      </div>
    );
  }
}

export default Main;
