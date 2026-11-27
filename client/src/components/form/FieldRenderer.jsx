import CheckboxGroup from './CheckboxGroup.jsx';
import NumericRating from './NumericRating.jsx';
import RadioGroup from './RadioGroup.jsx';
import TextareaInput from './TextareaInput.jsx';
import TextInput from './TextInput.jsx';

export default function FieldRenderer({ field, value, error, onChange }) {
  if (!field) return null;

  switch (field.type) {
    case 'textarea':
      return <TextareaInput field={field} value={value} onChange={onChange} />;
    case 'radio':
      return <RadioGroup field={field} value={value} onChange={onChange} />;
    case 'checkbox':
      return <CheckboxGroup field={field} value={value} onChange={onChange} />;
    case 'rating':
      return <NumericRating field={field} value={value} onChange={onChange} />;
    case 'text':
    case 'tel':
    case 'email':
    case 'date':
    case 'month':
    case 'number':
    default:
      return (
        <TextInput
          field={field}
          value={value}
          error={error}
          onChange={onChange}
        />
      );
  }
}
