import lunaImg from "@/assets/char-luna.png";
import leoImg from "@/assets/char-leo.png";
import botiImg from "@/assets/char-boti.png";
import miaImg from "@/assets/char-mia.png";
import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar3 from "@/assets/avatar-3.png";
import avatar4 from "@/assets/avatar-4.png";
import bagRed from "@/assets/bag-red.png";
import bagBlue from "@/assets/bag-blue.png";
import bagGreen from "@/assets/bag-green.png";
import bagYellow from "@/assets/bag-yellow.png";

export type CharacterId = "luna" | "leo" | "boti" | "mia";

export type Character = {
  id: CharacterId;
  name: string;
  image: string;
  /** Descripción en español para lectores de pantalla. */
  alt: string;
};

export const CHARACTERS: Record<CharacterId, Character> = {
  luna: {
    id: "luna",
    name: "Luna",
    image: lunaImg,
    alt: "Luna, la guía de la isla, saludando con la mano",
  },
  leo: {
    id: "leo",
    name: "Leo",
    image: leoImg,
    alt: "Leo, un explorador con gorra naranja y un mapa",
  },
  boti: {
    id: "boti",
    name: "Boti",
    image: botiImg,
    alt: "Boti, el robot que hace las credenciales",
  },
  mia: {
    id: "mia",
    name: "Mia",
    image: miaImg,
    alt: "Mia, la encargada del muelle, con sombrero de paja",
  },
};

export const AVATARS = [
  { id: "a1", image: avatar1, alt: "Exploradora de pelo negro largo y gorro verde" },
  { id: "a2", image: avatar2, alt: "Explorador pelirrojo con pañuelo azul" },
  { id: "a3", image: avatar3, alt: "Explorador con trencitas y lentes amarillos" },
  { id: "a4", image: avatar4, alt: "Exploradora con moño y pañuelo morado" },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];

export const BAGS = {
  red: { id: "red", image: bagRed, alt: "Mochila roja con una etiqueta en blanco" },
  blue: { id: "blue", image: bagBlue, alt: "Mochila azul con una etiqueta en blanco" },
  green: { id: "green", image: bagGreen, alt: "Mochila verde con una etiqueta en blanco" },
  yellow: { id: "yellow", image: bagYellow, alt: "Mochila amarilla con una etiqueta en blanco" },
} as const;

export type BagId = keyof typeof BAGS;
