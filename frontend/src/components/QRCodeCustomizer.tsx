import React, { useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import { Download, Palette, Image, Heart, Sparkles, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface QRCodeCustomizerProps {
  value: string;
  onClose: () => void;
}

interface QRCustomization {
  size: number;
  bgColor: string;
  fgColor: string;
  level: 'L' | 'M' | 'Q' | 'H';
  includeMargin: boolean;
  imageSettings: {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    excavate: boolean;
  } | null;
  emoji: string;
  pattern: 'square' | 'circle' | 'rounded';
  gradientEnabled: boolean;
  gradientColors: {
    start: string;
    end: string;
    direction: string;
  };
}

const QRCodeCustomizer: React.FC<QRCodeCustomizerProps> = ({ value, onClose }) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [customization, setCustomization] = useState<QRCustomization>({
    size: 256,
    bgColor: '#ffffff',
    fgColor: '#000000',
    level: 'M',
    includeMargin: true,
    imageSettings: null,
    emoji: '💕',
    pattern: 'square',
    gradientEnabled: false,
    gradientColors: {
      start: '#FFD700',
      end: '#FFA500',
      direction: 'to bottom right'
    }
  });

  const [activeTab, setActiveTab] = useState<'colors' | 'pattern' | 'emoji' | 'image' | 'advanced'>('colors');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const weddingEmojis = ['💕', '💖', '💗', '💝', '💞', '💟', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '🤎', '💍', '👰', '🤵', '💒', '🎊', '🎉', '🌹', '🌸', '🌺', '🌻', '🌷', '🥂', '🍾', '🎂', '💐', '🕊️', '🦋', '✨', '⭐', '💫', '🌟'];

  const colorPresets = [
    { name: 'Classic', bg: '#ffffff', fg: '#000000' },
    { name: 'Wedding Gold', bg: '#ffffff', fg: '#FFD700' },
    { name: 'Elegant Black', bg: '#000000', fg: '#ffffff' },
    { name: 'Rose Gold', bg: '#ffffff', fg: '#E8B4B8' },
    { name: 'Navy & Gold', bg: '#ffffff', fg: '#1e3a8a' },
    { name: 'Blush Pink', bg: '#ffffff', fg: '#F8BBD9' },
    { name: 'Sage Green', bg: '#ffffff', fg: '#9CAF88' },
    { name: 'Burgundy', bg: '#ffffff', fg: '#800020' }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        setUploadedImage(imageSrc);
        setCustomization(prev => ({
          ...prev,
          imageSettings: {
            src: imageSrc,
            x: prev.size / 2 - 25,
            y: prev.size / 2 - 25,
            width: 50,
            height: 50,
            excavate: true
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    const svg = qrRef.current?.querySelector('svg');
    
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'wedding-qr-code.png';
      link.href = canvas.toDataURL();
      link.click();
      toast.success('QR Code downloaded!');
    } else if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.download = 'wedding-qr-code.svg';
      link.href = svgUrl;
      link.click();
      URL.revokeObjectURL(svgUrl);
      toast.success('QR Code downloaded!');
    }
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setCustomization(prev => ({
      ...prev,
      bgColor: preset.bg,
      fgColor: preset.fg,
      gradientEnabled: false
    }));
  };

  const renderQRCode = () => {
    const qrProps: any = {
      value,
      size: customization.size,
      level: customization.level,
      includeMargin: customization.includeMargin,
      renderAs: 'svg'
    };

    if (customization.gradientEnabled) {
      // For gradient, we'll use a custom approach
      qrProps.bgColor = customization.bgColor;
      qrProps.fgColor = customization.gradientColors.start;
    } else {
      qrProps.bgColor = customization.bgColor;
      qrProps.fgColor = customization.fgColor;
    }

    if (customization.imageSettings) {
      qrProps.imageSettings = customization.imageSettings;
    }

    return <QRCode {...qrProps} />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-yellow-500" />
              Customize Your Wedding QR Code
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
              <div className="bg-white p-8 rounded-lg flex items-center justify-center relative">
                <div ref={qrRef} className="relative">
                  {renderQRCode()}
                  {customization.emoji && (
                    <div 
                      className="absolute text-4xl"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10,
                        background: customization.bgColor,
                        borderRadius: '50%',
                        padding: '4px'
                      }}
                    >
                      {customization.emoji}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={downloadQRCode}
                  className="btn-primary-gold px-4 py-2 rounded-lg flex items-center gap-2 flex-1"
                >
                  <Download size={16} />
                  Download QR Code
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(value);
                    toast.success('Link copied to clipboard!');
                  }}
                  className="btn-secondary-gold px-4 py-2 rounded-lg flex-1"
                >
                  Copy Link
                </button>
              </div>
            </div>

            {/* Customization Panel */}
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { id: 'colors', label: 'Colors', icon: Palette },
                  { id: 'pattern', label: 'Pattern', icon: Star },
                  { id: 'emoji', label: 'Emoji', icon: Heart },
                  { id: 'image', label: 'Image', icon: Image },
                  { id: 'advanced', label: 'Advanced', icon: Sparkles }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
                        activeTab === tab.id
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="bg-gray-800 rounded-lg p-4 min-h-[400px]">
                {activeTab === 'colors' && (
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold mb-3">Color Presets</h4>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {colorPresets.map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => applyColorPreset(preset)}
                          className="p-3 rounded-lg border border-gray-600 hover:border-yellow-500 transition-colors"
                          style={{ backgroundColor: preset.bg }}
                        >
                          <div className="text-xs font-medium mb-1" style={{ color: preset.fg }}>
                            {preset.name}
                          </div>
                          <div className="w-full h-4 rounded" style={{ backgroundColor: preset.fg }}></div>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Background Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={customization.bgColor}
                            onChange={(e) => setCustomization(prev => ({ ...prev, bgColor: e.target.value }))}
                            className="w-12 h-10 rounded border border-gray-600"
                          />
                          <input
                            type="text"
                            value={customization.bgColor}
                            onChange={(e) => setCustomization(prev => ({ ...prev, bgColor: e.target.value }))}
                            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Foreground Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={customization.fgColor}
                            onChange={(e) => setCustomization(prev => ({ ...prev, fgColor: e.target.value }))}
                            className="w-12 h-10 rounded border border-gray-600"
                          />
                          <input
                            type="text"
                            value={customization.fgColor}
                            onChange={(e) => setCustomization(prev => ({ ...prev, fgColor: e.target.value }))}
                            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-white">
                          <input
                            type="checkbox"
                            checked={customization.gradientEnabled}
                            onChange={(e) => setCustomization(prev => ({ ...prev, gradientEnabled: e.target.checked }))}
                            className="rounded"
                          />
                          Enable Gradient Effect
                        </label>
                      </div>

                      {customization.gradientEnabled && (
                        <div className="space-y-3 pl-6">
                          <div>
                            <label className="block text-white text-sm font-medium mb-2">
                              Gradient Start
                            </label>
                            <input
                              type="color"
                              value={customization.gradientColors.start}
                              onChange={(e) => setCustomization(prev => ({
                                ...prev,
                                gradientColors: { ...prev.gradientColors, start: e.target.value }
                              }))}
                              className="w-full h-10 rounded border border-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-white text-sm font-medium mb-2">
                              Gradient End
                            </label>
                            <input
                              type="color"
                              value={customization.gradientColors.end}
                              onChange={(e) => setCustomization(prev => ({
                                ...prev,
                                gradientColors: { ...prev.gradientColors, end: e.target.value }
                              }))}
                              className="w-full h-10 rounded border border-gray-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'pattern' && (
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold mb-3">Pattern Style</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'square', label: 'Square', preview: '⬛' },
                        { id: 'circle', label: 'Circle', preview: '⚫' },
                        { id: 'rounded', label: 'Rounded', preview: '🔲' }
                      ].map(pattern => (
                        <button
                          key={pattern.id}
                          onClick={() => setCustomization(prev => ({ ...prev, pattern: pattern.id as any }))}
                          className={`p-4 rounded-lg border text-center ${
                            customization.pattern === pattern.id
                              ? 'border-yellow-500 bg-yellow-500/20'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-2xl mb-2">{pattern.preview}</div>
                          <div className="text-white text-sm">{pattern.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'emoji' && (
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold mb-3">Wedding Emojis</h4>
                    <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                      {weddingEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => setCustomization(prev => ({ ...prev, emoji }))}
                          className={`p-2 rounded-lg text-2xl hover:bg-gray-700 ${
                            customization.emoji === emoji ? 'bg-yellow-500/20 ring-2 ring-yellow-500' : ''
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCustomization(prev => ({ ...prev, emoji: '' }))}
                      className="w-full py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                    >
                      Remove Emoji
                    </button>
                  </div>
                )}

                {activeTab === 'image' && (
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold mb-3">Custom Image</h4>
                    <div className="space-y-4">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 px-4 border-2 border-dashed border-gray-600 rounded-lg text-white hover:border-yellow-500 transition-colors"
                      >
                        <Image className="mx-auto mb-2" size={24} />
                        Click to upload image
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      
                      {uploadedImage && (
                        <div className="space-y-3">
                          <div className="bg-gray-700 p-3 rounded-lg">
                            <img src={uploadedImage} alt="Preview" className="w-16 h-16 object-cover rounded mx-auto" />
                          </div>
                          
                          <div>
                            <label className="block text-white text-sm font-medium mb-2">
                              Image Size: {customization.imageSettings?.width || 50}px
                            </label>
                            <input
                              type="range"
                              min="20"
                              max="100"
                              value={customization.imageSettings?.width || 50}
                              onChange={(e) => {
                                const size = parseInt(e.target.value);
                                setCustomization(prev => ({
                                  ...prev,
                                  imageSettings: prev.imageSettings ? {
                                    ...prev.imageSettings,
                                    width: size,
                                    height: size
                                  } : null
                                }));
                              }}
                              className="w-full"
                            />
                          </div>
                          
                          <button
                            onClick={() => {
                              setCustomization(prev => ({ ...prev, imageSettings: null }));
                              setUploadedImage(null);
                            }}
                            className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            Remove Image
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'advanced' && (
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold mb-3">Advanced Settings</h4>
                    
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Size: {customization.size}px
                      </label>
                      <input
                        type="range"
                        min="128"
                        max="512"
                        step="32"
                        value={customization.size}
                        onChange={(e) => setCustomization(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Error Correction Level
                      </label>
                      <select
                        value={customization.level}
                        onChange={(e) => setCustomization(prev => ({ ...prev, level: e.target.value as any }))}
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                      >
                        <option value="L">Low (7%)</option>
                        <option value="M">Medium (15%)</option>
                        <option value="Q">Quartile (25%)</option>
                        <option value="H">High (30%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-white">
                        <input
                          type="checkbox"
                          checked={customization.includeMargin}
                          onChange={(e) => setCustomization(prev => ({ ...prev, includeMargin: e.target.checked }))}
                          className="rounded"
                        />
                        Include Margin
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeCustomizer;