import { LightningElement } from 'lwc';
import searchWithSpotify from '@salesforce/apex/SpotifyIntegration.searchWithSpotify';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
export default class SearchSpotify extends LightningElement {

    searchSongs;
    displayResult = false;
    trackData = '';
    trackUrl = '';

    changeHandler(event){
        this.searchSongs = event.target.value;
    }

    //Handle Button Click
    async searchTrack(){
        let isValid = this.validInput();

        if(isValid){
            try{
                let responseString = await searchWithSpotify({
                    trackName:this.searchSongs
                })

                let response = JSON.parse(responseString);
                console.log('Response: ', JSON.stringify(response, null, 2));


                this.displayResult = true;

                this.trackData = response.tracks.items[0];//because we need first item from the list in Chrome browser inspect console

                this.trackUrl = this.trackData.album.images[0].url;
            }
            catch(error){
                console.log(error);
                this.showToast('Error', 'Something went Wrong', 'error');
            }
        }
    }

    //First make the condition where after valid input button click should work(lightning input 'required')
    validInput(){
        let isValid = true;
        let element = this.template.querySelector('lightning-input');

        if(!element.checkValidity()){
            element.reportValidity();
            isValid = false;
        }
        return isValid;
}

    showToast(title, message, variant){
        const event = new ShowToastEvent({
            title:title,
            message:message,
            variant:variant
        });

        this.dispatchEvent(event);
    }

    //Getter method
    get artistName(){
        let artistNameArray = this.trackData.artists.map(
            currentItem => currentItem.name
        );

        let artistNameString = artistNameArray.join(", ");

        return artistNameString;
    }


}