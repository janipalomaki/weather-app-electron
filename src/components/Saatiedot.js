import { useState, useEffect } from "react";

import { 
  Backdrop, 
  CircularProgress, 
  Typography, 
  Container,
  Card,
  CardContent,
  CardMedia,
  Button,
  Snackbar,
} from "@material-ui/core";

import {
  Dialog, 
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  TextField
} from '@material-ui/core';

// Snackbar
import Alert from '@material-ui/lab/Alert';


// Tyylit
import {makeStyles} from "@material-ui/core/styles";
const useStyles = makeStyles({
  otsikko : 
      {
        padding: "35px",
        marginBottom: "15px",
        fontSize : "28px",
        fontWeight : "bold"
      },
  tausta : 
      {
        backgroundColor : "#f3f0ff",
        width: "100%"
      },
  nappi : 
      {
        background: 'linear-gradient(45deg, #9878f5 30%, #794dfa 90%)',
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(152, 120, 245 .3)',
        color: 'white',
        height: 48,
        padding: '0 30px'
      }
});

// Remove accents
var accents = require('remove-accents');

function Saatiedot() {

// Otetaan tyylit käyttöön
const tyylit = useStyles();

// Dialogin tilamuuttujat
const [openDialog, setOpenDialog] = useState(false);
const [kaupunki, setKaupunki] = useState("Mikkeli");
const [haku, setHaku] = useState("");

// Snackbar
const [open, setOpen] = useState(false);

const handleClose = (event, reason) => {
  if (reason === 'clickaway') {
    return;
  }

  setOpen(false);
};
//

// Tilamuuttujat
const [data, setData] = useState({
      saatiedot : [],
      virhe : null,
      tiedotHaettu: false
});


const tarkistaTiedot = async () => {
    try {

      const yhteys = await fetch("https://so3server.herokuapp.com/saatilanne/" + kaupunki);
      const tiedot = await yhteys.json();
      setHaku(accents.remove(tiedot.name));
   
    } catch(e){
      setHaku("");
    }
}


// Haetaan säätiedot 
const haeTiedot = async () => {

try {

  const yhteys = await fetch("https://so3server.herokuapp.com/saatilanne/" + kaupunki);
  const tiedot = await yhteys.json();
 
  setData({
  ...data,
  saatiedot : tiedot,
  tiedotHaettu : true
  });

  } catch (e) {

    setData({
    ...data,
    virhe : `Palvelimeen ei saatu yhteyttä ${e.message}`,
    tiedotHaettu : true
    });
  }
}

//console.log(data.saatiedot);

useEffect(() => {
  haeTiedot();
}, []);

useEffect(() => {
  tarkistaTiedot();
}, [kaupunki]);


  return (
      <Container>
      <Typography 
      className={tyylit.otsikko}
      variant="h4"
      >Mobiilisää</Typography>

      {(data.tiedotHaettu)
      // Ladataan säätiedot tähän
      ? <Card
        className={tyylit.tausta}
        >
        <CardMedia
          style={{ height: 150, width: 150 }}
          image={"http://openweathermap.org/img/wn/" + data.saatiedot.weather[0].icon + "@2x.png"}
        />

        <CardContent id="tiedot">
          <Typography variant="h4">{data.saatiedot.name}</Typography>
          <Typography variant="h5">{data.saatiedot.main.temp} &#8451; </Typography>
          <Typography variant="h6">{data.saatiedot.weather[0].description} </Typography>
        </CardContent>

        <CardContent id="button">
        <Button 
            className={tyylit.nappi}
            fullWidth={true}
            onClick={() => {
                setOpenDialog(true)
            }}
            >Vaihda kaupunki
            </Button>
        </CardContent>

      {/* Dialogi */}
      <Dialog open={openDialog} fullWidth>
            <DialogTitle>
           Syötä kaupungin nimi:
            </DialogTitle>

            <DialogContent>
                <FormControl>
                  <TextField
                  label="Kaupunki"
                  variant="outlined"
                  fullWidth={true}
                  placeholder="Kaupunki"
                  onChange={(e) => {
                    setKaupunki(accents.remove(e.target.value));
                    //console.log(accents.remove(e.target.value));
                  }}
                  />
                </FormControl>
            </DialogContent>

            <DialogActions>
                <Button 
                    className={tyylit.nappi}
                    onClick={() => {
                        
                        tarkistaTiedot();

                        if(kaupunki === haku){
                          setOpen(false);
                          setOpenDialog(false);
                          haeTiedot();  
                        } else {
                          setOpen(true);
                        }
                    }}
                    >Ok
                </Button>
                <Snackbar 
                    open={open}
                    autoHideDuration={6000}
                    onClose={handleClose}
                    >
                    <Alert onClose={handleClose} severity="warning">
                        Paikkakuntaa ei löydy! Tarkista syöttämäsi tiedot.
                        Huomio isot ja pienet kirjaimet kirjoitusasussa.
                    </Alert>
                </Snackbar>
            </DialogActions>
        </Dialog>
        {/* Dialogi */}

      </Card>
      
      // Ladataan tietoja - progress ikoni
      : <Backdrop open={true}>
          <CircularProgress color="inherit"/>
      </Backdrop>
      }
      </Container>

  );
}

export default Saatiedot;
