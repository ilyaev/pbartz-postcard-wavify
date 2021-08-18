import React, { useState } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import WaveformData from "waveform-data";
import QRCode from "qrcode.react";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const onChangeFile = (e: any, setUrl: any) => {
  var reader = new FileReader();

  // Tell the reader to read the file as an ArrayBuffer
  reader.readAsArrayBuffer(e.target.files[0]);

  // When the reader has loaded the read the file as an ArrayBuffer
  reader.onload = function (event: any) {
    var arrayBuffer = event.target.result;

    console.log("ARB:", arrayBuffer);

    const audioContext = new AudioContext();
    const options = {
      audio_context: audioContext,
      array_buffer: arrayBuffer,
      scale: 128,
    };

    WaveformData.createFromAudio(options, (err, waveform) => {
      if (err) {
        console.log("ERR:", err);
      } else {
        console.log("WF:", waveform);
        const scaleY = (amplitude: any, height: any) => {
          const range = 256;
          const offset = 128;

          return height - ((amplitude + offset) * height) / range;
        };

        const canvas = document.getElementById("canvas") as any;
        const ctx = canvas.getContext("2d");
        ctx.beginPath();

        const channel = waveform.channel(0);

        const step = waveform.length / 800;

        // Loop forwards, drawing the upper half of the waveform
        for (let x = 0; x < 800; x++) {
          const val = channel.max_sample(x * step);

          ctx.lineTo(x + 0.5, scaleY(val, canvas.height) + 0.5);
        }

        // Loop backwards, drawing the lower half of the waveform
        for (let x = 800 - 1; x >= 0; x--) {
          const val = channel.min_sample(x * step);

          ctx.lineTo(x + 0.5, scaleY(val, canvas.height) + 0.5);
        }

        setUrl("https://i.imgur.com/4p0hy8r.jpg");

        ctx.closePath();
        ctx.stroke();
        ctx.fill();
      }
    });
  };
};

export function Form() {
  const classes = useStyles();

  const [url, setUrl] = useState("");

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Upload WAV file<br></br>
          <br></br>
        </Typography>
        <input type="file" onChange={(e: any) => onChangeFile(e, setUrl)} />
        <form className={classes.form} noValidate></form>
        <canvas id="canvas" width="800"></canvas>
        {url && <QRCode value={url} />}
      </div>
    </Container>
  );
}
