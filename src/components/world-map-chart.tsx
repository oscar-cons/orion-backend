'use client';

import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Tooltip } from 'react-tooltip'

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
            <ComposableMap data-tooltip-id="map-tooltip" projectionConfig={{ scale: 147 }} style={{ width: '100%', height: '100%' }}>
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
                                    data-tooltip-content={countryData ? `${mappedName}: ${countryData.value} sources` : `${mappedName}: 0 sources`}
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
            <Tooltip 
              id="map-tooltip" 
              style={{ 
                background: 'hsl(var(--popover))', 
                color: 'hsl(var(--popover-foreground))', 
                borderRadius: 'var(--radius)',
                border: '1px solid hsl(var(--border))',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                fontSize: '0.75rem',
                padding: '0.5rem 0.75rem'
              }} 
            />
        </>
    );
}
