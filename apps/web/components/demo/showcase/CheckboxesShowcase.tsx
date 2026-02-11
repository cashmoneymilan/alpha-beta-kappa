'use client';

import { useState } from 'react';
import { Check, Minus } from 'lucide-react';
import { getThemeStyles } from '../themes';

interface CheckboxesShowcaseProps {
  themeName: string;
}

export function CheckboxesShowcase({ themeName }: CheckboxesShowcaseProps) {
  const theme = getThemeStyles(themeName);
  const [checks, setChecks] = useState({
    notifications: true,
    sound: false,
    email: true,
    sms: false,
  });
  const [orderType, setOrderType] = useState('market');
  const [timeInForce, setTimeInForce] = useState('day');

  const labelStyle = {
    color: `hsl(${theme.colors['--demo-foreground']})`,
    fontSize: '12px',
    fontFamily: "'Consolas', 'Monaco', monospace",
  };

  const mutedStyle = {
    color: `hsl(${theme.colors['--demo-muted-foreground']})`,
    fontSize: '11px',
    fontFamily: "'Consolas', 'Monaco', monospace",
  };

  const checkboxBaseStyle = {
    width: '16px',
    height: '16px',
    border: `2px solid hsl(${theme.colors['--demo-border']})`,
    background: `hsl(${theme.colors['--demo-input']})`,
    borderRadius: '0px',
  };

  const checkboxCheckedStyle = {
    ...checkboxBaseStyle,
    background: `hsl(${theme.colors['--demo-primary']})`,
    borderColor: `hsl(${theme.colors['--demo-primary']})`,
  };

  const radioBaseStyle = {
    width: '16px',
    height: '16px',
    border: `2px solid hsl(${theme.colors['--demo-border']})`,
    background: `hsl(${theme.colors['--demo-input']})`,
    borderRadius: '50%',
  };

  const radioCheckedStyle = {
    ...radioBaseStyle,
    borderColor: `hsl(${theme.colors['--demo-primary']})`,
  };

  const sectionLabelStyle = {
    color: `hsl(${theme.colors['--demo-muted-foreground']})`,
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    fontFamily: "'Consolas', 'Monaco', monospace",
  };

  return (
    <div className="space-y-6">
      {/* Checkboxes */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Notification Settings</span>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            className="flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
            style={checks.notifications ? checkboxCheckedStyle : checkboxBaseStyle}
          >
            {checks.notifications && <Check className="w-3 h-3" style={{ color: `hsl(${theme.colors['--demo-primary-foreground']})` }} />}
          </div>
          <div>
            <div style={labelStyle}>Push Notifications</div>
            <div style={mutedStyle}>Receive alerts on your device</div>
          </div>
          <input
            type="checkbox"
            checked={checks.notifications}
            onChange={(e) => setChecks({ ...checks, notifications: e.target.checked })}
            className="sr-only"
          />
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            className="flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
            style={checks.sound ? checkboxCheckedStyle : checkboxBaseStyle}
          >
            {checks.sound && <Check className="w-3 h-3" style={{ color: `hsl(${theme.colors['--demo-primary-foreground']})` }} />}
          </div>
          <div>
            <div style={labelStyle}>Sound Alerts</div>
            <div style={mutedStyle}>Play audio on triggers</div>
          </div>
          <input
            type="checkbox"
            checked={checks.sound}
            onChange={(e) => setChecks({ ...checks, sound: e.target.checked })}
            className="sr-only"
          />
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            className="flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
            style={checks.email ? checkboxCheckedStyle : checkboxBaseStyle}
          >
            {checks.email && <Check className="w-3 h-3" style={{ color: `hsl(${theme.colors['--demo-primary-foreground']})` }} />}
          </div>
          <div>
            <div style={labelStyle}>Email Digests</div>
            <div style={mutedStyle}>Daily summary of activity</div>
          </div>
          <input
            type="checkbox"
            checked={checks.email}
            onChange={(e) => setChecks({ ...checks, email: e.target.checked })}
            className="sr-only"
          />
        </label>

        {/* Indeterminate State */}
        <label className="flex items-start gap-3 cursor-pointer group opacity-50">
          <div
            className="flex items-center justify-center flex-shrink-0 mt-0.5"
            style={checkboxCheckedStyle}
          >
            <Minus className="w-3 h-3" style={{ color: `hsl(${theme.colors['--demo-primary-foreground']})` }} />
          </div>
          <div>
            <div style={labelStyle}>Select All (Indeterminate)</div>
            <div style={mutedStyle}>Some items selected</div>
          </div>
        </label>
      </div>

      {/* Radio Buttons - Order Type */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Order Type</span>

        {[
          { id: 'market', label: 'Market Order', desc: 'Execute at current price' },
          { id: 'limit', label: 'Limit Order', desc: 'Execute at specified price' },
          { id: 'stop', label: 'Stop Order', desc: 'Trigger at stop price' },
        ].map((option) => (
          <label key={option.id} className="flex items-start gap-3 cursor-pointer">
            <div
              className="flex items-center justify-center flex-shrink-0 mt-0.5"
              style={orderType === option.id ? radioCheckedStyle : radioBaseStyle}
            >
              {orderType === option.id && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: `hsl(${theme.colors['--demo-primary']})` }}
                />
              )}
            </div>
            <div>
              <div style={labelStyle}>{option.label}</div>
              <div style={mutedStyle}>{option.desc}</div>
            </div>
            <input
              type="radio"
              name="orderType"
              value={option.id}
              checked={orderType === option.id}
              onChange={(e) => setOrderType(e.target.value)}
              className="sr-only"
            />
          </label>
        ))}
      </div>

      {/* Inline Radio Group */}
      <div className="space-y-2">
        <span style={sectionLabelStyle}>Time in Force</span>
        <div className="flex gap-1">
          {[
            { id: 'day', label: 'DAY' },
            { id: 'gtc', label: 'GTC' },
            { id: 'ioc', label: 'IOC' },
            { id: 'fok', label: 'FOK' },
          ].map((option) => (
            <label
              key={option.id}
              className="flex-1 text-center py-2 cursor-pointer transition-colors"
              style={{
                background: timeInForce === option.id
                  ? `hsl(${theme.colors['--demo-primary']})`
                  : `hsl(${theme.colors['--demo-muted']})`,
                color: timeInForce === option.id
                  ? `hsl(${theme.colors['--demo-primary-foreground']})`
                  : `hsl(${theme.colors['--demo-muted-foreground']})`,
                fontSize: '11px',
                fontFamily: "'Consolas', 'Monaco', monospace",
                fontWeight: '600',
              }}
            >
              {option.label}
              <input
                type="radio"
                name="timeInForce"
                value={option.id}
                checked={timeInForce === option.id}
                onChange={(e) => setTimeInForce(e.target.value)}
                className="sr-only"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="space-y-2">
        <span style={sectionLabelStyle}>Trading Mode</span>
        <div className="flex items-center justify-between p-3" style={{ background: `hsl(${theme.colors['--demo-muted']})` }}>
          <div>
            <div style={labelStyle}>Paper Trading</div>
            <div style={mutedStyle}>Practice with simulated funds</div>
          </div>
          <button
            className="relative w-11 h-6 rounded-full transition-colors"
            style={{
              background: checks.sms
                ? `hsl(${theme.colors['--demo-bullish']})`
                : `hsl(${theme.colors['--demo-border']})`,
            }}
            onClick={() => setChecks({ ...checks, sms: !checks.sms })}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full transition-transform"
              style={{
                background: `hsl(${theme.colors['--demo-foreground']})`,
                left: checks.sms ? '24px' : '4px',
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
