import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Airtable from "airtable";
import Image from "next/image";
import { gsap } from "gsap";

interface Playing {
  artistName: string;
  isPlaying: boolean;
  songName: string;
  url: string;
  coverImageUrl: string;
}

const Spotify = () => {
  interface Token {
    token: string;
    expires: number;
    created: number;
  }

  const tokenRef = useRef<Token | null>(null);
  const [playing, setPlaying] = useState<Playing | null>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeTween = useRef<gsap.core.Timeline | null>(gsap.timeline());

  useEffect(() => {
    Airtable.configure({
      endpointUrl: "https://api.airtable.com",
      apiKey: process.env.NEXT_PUBLIC_AIRTABLE_PAT,
    });

    const getNewToken = async () => {
      const params = new URLSearchParams();
      params.append("grant_type", "refresh_token");
      params.append(
        "refresh_token",
        process.env.NEXT_PUBLIC_SPOTIFY_REFRESH_TOKEN || ""
      );

      const encoded = btoa(
        `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`
      );

      const headers = {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/x-www-form-urlencoded",
      };

      const res = await axios.post(
        "https://accounts.spotify.com/api/token",
        params,
        { headers }
      );

      return res;
    };

    const updateToken = async () => {
      const res = await getNewToken();
      const { access_token, expires_in } = res.data;

      const created = Date.now();
      const newToken = {
        token: access_token,
        expires: (expires_in - 300) * 1000,
        created,
      };

      tokenRef.current = newToken;

      const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
      if (!baseId) {
        throw new Error("AIRTABLE_BASE_ID is not defined");
      }
      const base = Airtable.base(baseId);

      base("token").update(
        [
          {
            id: "recqE1aukcial9KAW",
            fields: {
              token: access_token,
              expiry: (expires_in - 300) * 1000,
              created,
            },
          },
        ],
        function (err: Airtable.Error) {
          if (err) {
            console.error(err);
            return;
          }
        }
      );
    };

    const getNowPlaying = async () => {
      let songName = "";
      let isPlaying = false;
      let artistName = "";
      let url = "";
      let coverImageUrl = "";

      if (!tokenRef.current) {
        throw new Error("Token is null");
      }

      const headers = {
        Authorization: `Bearer ${tokenRef.current.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const res = await axios.get(
        "https://api.spotify.com/v1/me/player/currently-playing",
        { headers }
      );

      if (
        res.data.is_playing === false ||
        res.data.currently_playing_type !== "track"
      ) {
        const res = await axios.get(
          "https://api.spotify.com/v1/me/player/recently-played?limit=1",
          { headers }
        );

        const playHistory = res.data.items;
        const recentTrack = playHistory[0].track;

        songName = recentTrack.name;
        isPlaying = false;
        artistName = recentTrack.artists[0].name;
        url = recentTrack.external_urls.spotify;
        coverImageUrl = recentTrack.album.images[0].url;
      } else {
        const track = res.data.item;

        songName = track.name;
        isPlaying = res.data.is_playing;
        artistName = track.artists[0].name;
        url = track.external_urls.spotify;
        coverImageUrl = track.album.images[0].url;
      }

      return {
        artistName,
        isPlaying,
        songName,
        url,
        coverImageUrl,
      };
    };

    const init = async () => {
      try {
        const tokenValid = (token: Token) => {
          const now = Date.now();
          const expiry = Number(token.created) + Number(token.expires);

          return now < expiry;
        };

        const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

        if (!baseId) {
          throw new Error("AIRTABLE_BASE_ID is not defined");
        }

        const base = Airtable.base(baseId);

        const res = await base("token").select().firstPage();
        const currentToken = res[0].fields as unknown as Token;

        if (currentToken && !tokenValid(currentToken)) {
          await updateToken();
        }

        if (!currentToken) {
          await updateToken();
        }

        const nowPlaying = await getNowPlaying();
        setPlaying(nowPlaying);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          if (
            error.response.data.error.message === "The access token expired"
          ) {
            await updateToken();
            const nowPlaying = await getNowPlaying();
            setPlaying(nowPlaying);
          }
        }
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (marqueeRef.current) {
      marqueeTween.current?.to(
        marqueeRef.current.querySelectorAll(".marquee__part"),
        {
          xPercent: -100,
          repeat: -1,
          duration: 10,
          ease: "linear",
        }
      );

      marqueeTween.current?.set(
        marqueeRef.current.querySelector(".marquee__inner"),
        {
          xPercent: -50,
        }
      );
    }

    const tween = marqueeTween.current;

    return () => {
      if (tween) {
        tween.kill();
      }
    };
  }, []);

  const handleMouseEnter = () => {
    marqueeTween.current?.timeScale(3);
  };

  const handleMouseLeave = () => {
    marqueeTween.current?.timeScale(1);
  };

  return (
    <a
      href={playing?.url}
      target="_blank"
      rel="noopener noreferrer"
      id="spotify-player"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="vinyl-wrapper">
        <div className="vinyl">
          <Image
            fill
            unoptimized
            priority
            src={playing?.isPlaying ? "/playing.gif" : "/not-playing.png"}
            alt={
              playing?.isPlaying
                ? playing.songName
                : "No song playing right now"
            }
          />
        </div>
      </div>
      <div className="marquee" ref={marqueeRef}>
        <div className="marquee__inner" aria-hidden="true">
          {Array(6)
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                className="marquee__part"
                data-text={
                  playing?.isPlaying
                    ? `${playing.artistName} - ${playing.songName}`
                    : "No track playing... it feels a little lonely."
                }
              >
                {playing?.isPlaying
                  ? `${playing.artistName} - ${playing.songName}`
                  : "No track playing... it feels a little lonely."}
              </div>
            ))}
        </div>
      </div>
    </a>
  );
};

export default Spotify;
