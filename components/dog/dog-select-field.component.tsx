import { observer } from "mobx-react-lite";
import FormField from "../utils/forms/form-field.component";

const DogSelectField = observer(function DogSelectField({
  name,
  ...props
}: {
  name: string;
  placeholder?: string;
}) {
  return (
    <FormField name={name} as="select" {...props}>
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
    </FormField>
  );
});

export default DogSelectField;
