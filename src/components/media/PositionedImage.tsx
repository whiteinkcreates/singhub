/* eslint-disable @next/next/no-img-element */
import type {ComponentProps} from 'react';
import {placementStyle,type ResponsiveImagePlacement,type ImageViewport} from '@/lib/imagePlacement';
import './imagePlacement.css';

export function PositionedImage({placement,position,viewport,style,...props}:ComponentProps<'img'>&{placement?:ResponsiveImagePlacement;position?:string;viewport?:ImageViewport}) {
  return <img {...props} data-image-placement={placement?'':undefined} style={{...style,...placementStyle(placement,position,viewport)}} />;
}
