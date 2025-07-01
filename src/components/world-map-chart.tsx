'use client';

import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Tooltip as ReactTooltip } from 'react-tooltip'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const countryNameMapping: { [key: string]: string } = {
  'United States of America': 'USA',
};

type MapChartProps = {
    data: { name: string; value: number; fill: string }[];
}

export function WorldMapChart({ data }: MapChartProps) {
    const dataMap = new Map(data.map(d => [d.name, d]));

    return (
        <>
            <ComposableMap 
                projectionConfig={{ scale: 147 }} 
                style={{ width: '100%', height: '100%' }}
                data-tooltip-id="map-tooltip"
            >
                <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            const countryName = geo.properties.name;
                            const mappedName = countryNameMapping[countryName] || countryName;
                            const countryData = dataMap.get(mappedName);

                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    data-tooltip-content={countryData ? `${mappedName}: ${countryData.value} sources` : `${mappedName}: No sources`}
                                    style={{
                                        default: {
                                            fill: countryData ? countryData.fill : 'hsl(var(--card))',
                                            outline: 'none',
                                            stroke: 'hsl(var(--border))',
                                            strokeWidth: 0.75,
                                        },
                                        hover: {
                                            fill: countryData ? countryData.fill : 'hsl(var(--card))',
                                            outline: 'none',
                                            stroke: 'hsl(var(--ring))',
                                            strokeWidth: 1,
                                            filter: 'brightness(1.2)'
                                        },
                                        pressed: {
                                            fill: countryData ? countryData.fill : 'hsl(var(--card))',
                                            outline: 'none',
                                            stroke: 'hsl(var(--ring))',
                                            strokeWidth: 1,
                                        },
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>
            <ReactTooltip id="map-tooltip" />
        </>
    );
}
