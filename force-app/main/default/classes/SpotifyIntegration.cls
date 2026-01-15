public with sharing class SpotifyIntegration {

    @AuraEnabled
    public static String searchWithSpotify(String trackName){

        //Create the instance of HttpRequest Class
        HttpRequest req = new HttpRequest();

        //To safely transmit data within urls & request bodies
        String encodedName = EncodingUtil.urlEncode(trackName, 'UTF-8');

        req.setMethod('GET');
        //https://api.spotify.com/v1/search?q=Despacito&type=track&limit=1&offset=1
        req.setEndpoint('callout:Spotify/v1/search?q=' + encodedName + '&type=track&limit=5');

        //Create the Instance of Http Class
        Http httpObj = new Http();

        //send request
        try{
            HttpResponse res = httpObj.send(req);

            System.debug('Response: '+res.getBody());
            System.debug('Response Status: '+res.getStatus());
            System.debug('Response Status Code: '+res.getStatusCode());

            if(res.getStatusCode() == 200){
                return res.getBody();
            }
            else{
                throw new AuraHandledException(res.getBody());
            }
        }
        catch(Exception ex){
            System.debug(ex.getMessage());
            throw new AuraHandledException(ex.getMessage());
        }
    }
}