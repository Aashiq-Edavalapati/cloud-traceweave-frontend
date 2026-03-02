import React from 'react';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../dashboard_panel_components/MetricCard';
import { Clock } from 'lucide-react';

describe('MetricCard Component', () => {
    const mockProps = {
        title: 'Avg Latency',
        value: '142',
        unit: 'ms',
        trend: '+12%',
        icon: Clock,
    };

    it('renders the title, value, and unit correctly', () => {
        render(<MetricCard {...mockProps} />);

        expect(screen.getByText('Avg Latency')).toBeInTheDocument();
        expect(screen.getByText('142')).toBeInTheDocument();
        expect(screen.getByText('ms')).toBeInTheDocument();
    });

    it('renders the trend correctly', () => {
        render(<MetricCard {...mockProps} />);

        expect(screen.getByText('+12%')).toBeInTheDocument();
        expect(screen.getByText('vs last hour')).toBeInTheDocument();
    });

    it('applies correct color for bad upward trend', () => {
        // trendUpBad is true by default. +12% should be bad (red)
        render(<MetricCard {...mockProps} />);
        const trendElement = screen.getByText('+12%').parentElement;
        expect(trendElement).toHaveClass('text-red-400');
    });

    it('applies correct color for good upward trend', () => {
        render(<MetricCard {...mockProps} trendUpBad={false} />);
        // trendUpBad=false. +12% should be good (green)
        const trendElement = screen.getByText('+12%').parentElement;
        expect(trendElement).toHaveClass('text-green-400');
    });

    it('applies correct color for good downward trend (default trendUpBad=true)', () => {
        render(<MetricCard {...mockProps} trend="-10%" />);
        // Logic: trend="-10%", isPositive=false. isBad = false.
        // Result should be "Good" -> green
        const trendElement = screen.getByText('-10%').parentElement;
        expect(trendElement).toHaveClass('text-green-400'); 
    });
});