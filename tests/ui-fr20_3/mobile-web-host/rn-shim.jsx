import React from 'react';

const UNITLESS_PROPS = new Set([
  'flex',
  'flexGrow',
  'flexShrink',
  'opacity',
  'zIndex',
  'fontWeight',
  'lineHeight',
  'elevation',
]);

function normalizeStyle(styleProp, defaultStyle = {}) {
  const rawList = Array.isArray(styleProp) ? styleProp.flat(Infinity).filter(Boolean) : styleProp ? [styleProp] : [];
  const merged = Object.assign({}, defaultStyle, ...rawList);
  const css = {};

  for (const [key, val] of Object.entries(merged)) {
    if (val === undefined || val === null || val === false) continue;
    if (key === 'paddingHorizontal') {
      const v = typeof val === 'number' ? `${val}px` : val;
      css.paddingLeft = v;
      css.paddingRight = v;
    } else if (key === 'paddingVertical') {
      const v = typeof val === 'number' ? `${val}px` : val;
      css.paddingTop = v;
      css.paddingBottom = v;
    } else if (key === 'marginHorizontal') {
      const v = typeof val === 'number' ? `${val}px` : val;
      css.marginLeft = v;
      css.marginRight = v;
    } else if (key === 'marginVertical') {
      const v = typeof val === 'number' ? `${val}px` : val;
      css.marginTop = v;
      css.marginBottom = v;
    } else if (key === 'transform' && Array.isArray(val)) {
      css.transform = val
        .map(t => {
          const [k, tv] = Object.entries(t)[0];
          return `${k}(${typeof tv === 'number' ? `${tv}px` : tv})`;
        })
        .join(' ');
    } else if (key === 'elevation' || key === 'textAlignVertical') {
      // Bỏ qua thuộc tính riêng Android
    } else if (typeof val === 'number' && !UNITLESS_PROPS.has(key)) {
      css[key] = `${val}px`;
    } else if (key === 'lineHeight' && typeof val === 'number') {
      css.lineHeight = `${val}px`;
    } else {
      css[key] = val;
    }
  }
  return css;
}

export const StyleSheet = {
  create: styles => styles,
};

export const View = ({ style, children, ...rest }) => (
  <div
    style={normalizeStyle(style, {
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    })}
    {...rest}
  >
    {children}
  </div>
);

export const SafeAreaView = ({ style, children, ...rest }) => (
  <div
    style={normalizeStyle(style, {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    })}
    {...rest}
  >
    {children}
  </div>
);

export const ScrollView = ({ style, contentContainerStyle, children, ...rest }) => (
  <div
    style={normalizeStyle([style, contentContainerStyle], {
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      boxSizing: 'border-box',
    })}
    {...rest}
  >
    {children}
  </div>
);

export const Text = ({ style, onPress, numberOfLines, children, ...rest }) => (
  <span
    onClick={onPress}
    style={normalizeStyle(style, {
      display: 'inline-block',
      cursor: onPress ? 'pointer' : 'inherit',
      ...(numberOfLines === 1
        ? { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
        : {}),
    })}
    {...rest}
  >
    {children}
  </span>
);

export const TouchableOpacity = ({ style, onPress, disabled, children, ...rest }) => (
  <button
    type="button"
    disabled={!!disabled}
    onClick={disabled ? undefined : onPress}
    style={normalizeStyle(style, {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      padding: 0,
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
    })}
    {...rest}
  >
    {children}
  </button>
);

export const TextInput = ({
  style,
  value,
  onChangeText,
  placeholder,
  editable = true,
  secureTextEntry = false,
  multiline = false,
  keyboardType,
  autoCapitalize,
  ...rest
}) => {
  const commonProps = {
    value: value ?? '',
    placeholder,
    readOnly: editable === false,
    disabled: editable === false,
    onChange: e => {
      if (editable !== false && onChangeText) {
        onChangeText(e.target.value);
      }
    },
    style: normalizeStyle(style, {
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      fontSize: '14px',
    }),
    ...rest,
  };
  if (multiline) {
    return <textarea {...commonProps} />;
  }
  return <input type={secureTextEntry ? 'password' : 'text'} {...commonProps} />;
};

export const Image = ({ source, style, resizeMode, ...rest }) => (
  <img
    src={source && source.uri ? source.uri : ''}
    alt=""
    style={normalizeStyle(style, {
      objectFit: resizeMode === 'stretch' ? 'fill' : 'cover',
      display: 'block',
    })}
    {...rest}
  />
);

export const FlatList = ({ data = [], renderItem, keyExtractor, contentContainerStyle }) => (
  <div
    style={normalizeStyle(contentContainerStyle, {
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    })}
  >
    {data.map((item, index) => (
      <React.Fragment key={keyExtractor ? keyExtractor(item, index) : index}>
        {renderItem({ item, index })}
      </React.Fragment>
    ))}
  </div>
);

export const Alert = {
  alert: (title, message) => {
    if (typeof window !== 'undefined') {
      window.__lastMobileAlert = { title, message };
      window.alert(`${title}\n${message || ''}`);
    }
  },
};

export const StatusBar = () => null;
