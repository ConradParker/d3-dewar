
/*!
 * @license Open source under BSD 2-clause (http://choosealicense.com/licenses/bsd-2-clause/)
 * Copyright (c) 2015, Curtis Bratton
 * All rights reserved.
 *
 * Liquid Fill Gauge v1.1
 */
export default function () {
  return {
    minValue: 0, // The gauge minimum value.
    maxValue: 100, // The gauge maximum value.
    circleThickness: 0.2, // The outer circle thickness as a percentage of it's radius.
    circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle.
    circleColor: '#1e824c', // The color of the outer circle.
    waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
    waveCount: 1, // The number of full waves per width of the wave circle.
    waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise.
    waveAnimateTime: 6000, // Time in milliseconds for a full wave to enter the wave circle.
    waveRise: true, // Control if the wave should rise from 0, or start at it's full height.
    waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages.
    waveAnimate: true, // Controls if the wave scrolls or is static.
    waveColor: '#1e824c', // The color of the fill wave.
    waveOffset: 0, // Initially offset the wave. 0 = no offset. 1 = offset of one full wave.
    textVertPosition: 0.5, // Percentage text height within the wave circle. 0 = bottom, 1 = top.
    textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
    valueCountUp: true, // The displayed value counts from 0 to it's final value upon loading.
    displayPercent: true, // If true, a % symbol is displayed after the value.
    textColor: '#fff', // The color of the value text when the wave does not overlap it.
    waveTextColor: '#ffff00', // The color of the value text when the wave overlaps it.
  };
}
