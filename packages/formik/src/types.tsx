import * as React from 'react';
/**
 * Values of fields in the form
 */
export interface FormikValues {
  [field: string]: any;
}

/**
 * An object containing error messages whose keys correspond to FormikValues.
 * Should always be an object of strings, but any is allowed to support i18n libraries.
 */
export type FormikErrors<Values extends FormikValues> = {
  [K in keyof Values]?: Values[K] extends any[]
    ? Values[K][number] extends object // [number] is the special sauce to get the type of array's element. More here https://github.com/Microsoft/TypeScript/pull/21316
      ? FormikErrors<Values[K][number]>[] | string | string[]
      : string | string[]
    : Values[K] extends object
    ? FormikErrors<Values[K]>
    : string;
};

/**
 * An object containing touched state of the form whose keys correspond to FormikValues.
 */
export type FormikTouched<Values extends FormikValues> = {
  [K in keyof Values]?: Values[K] extends any[]
    ? Values[K][number] extends object // [number] is the special sauce to get the type of array's element. More here https://github.com/Microsoft/TypeScript/pull/21316
      ? FormikTouched<Values[K][number]>[]
      : boolean
    : Values[K] extends object
    ? FormikTouched<Values[K]>
    : boolean;
};

/**
 * Formik state tree
 */
export interface FormikState<Values extends FormikValues, Status> {
  /** Form values */
  values: Values;
  /** map of field names to specific error for that field */
  errors: FormikErrors<Values>;
  /** map of field names to whether the field has been touched */
  touched: FormikTouched<Values>;
  /** whether the form is currently submitting */
  isSubmitting: boolean;
  /** whether the form is currently validating (prior to submission) */
  isValidating: boolean;
  /** Top level status state, in case you need it */
  status?: Status;
  /** Number of times user tried to submit the form */
  submitCount: number;
}

/**
 * Formik computed properties. These are read-only.
 */
export interface FormikComputedProps<Values extends FormikValues, Status> {
  /** True if any input has been touched. False otherwise. */
  readonly dirty: boolean;
  /** True if state.errors is empty */
  readonly isValid: boolean;
  /** The initial values of the form */
  readonly initialValues: Values;
  /** The initial errors of the form */
  readonly initialErrors: FormikErrors<Values>;
  /** The initial visited fields of the form */
  readonly initialTouched: FormikTouched<Values>;
  /** The initial status of the form */
  readonly initialStatus?: Status;
}

/**
 * Formik state helpers
 */
export interface FormikHelpers<Values extends FormikValues, Status> {
  /** Manually set top level status. */
  setStatus(status?: Status): void;
  /** Manually set errors object */
  setErrors(errors: FormikErrors<Values>): void;
  /** Manually set isSubmitting */
  setSubmitting(isSubmitting: boolean): void;
  /** Manually set touched object */
  setTouched(touched: FormikTouched<Values>, shouldValidate?: boolean): void;
  /** Manually set values object  */
  setValues(values: Values, shouldValidate?: boolean): void;
  /** Set value of form field directly */
  setFieldValue<T extends keyof Values>(field: T, value: Values[T], shouldValidate?: boolean): void;
  /** Set error message of a form field directly */
  setFieldError(field: keyof Values, message: string): void;
  /** Set whether field has been touched directly */
  setFieldTouched(
    field: keyof Values,
    isTouched?: boolean,
    shouldValidate?: boolean
  ): void;
  /** Validate form values */
  validateForm(values?: Values): Promise<FormikErrors<Values>>;
  /** Validate field value */
  validateField(field: keyof Values): void;
  /** Reset form */
  resetForm(nextState?: Partial<FormikState<Values, Status>>): void;
  /** Set Formik state, careful! */
  setFormikState(
    f:
      | FormikState<Values, Status>
      | ((prevState: FormikState<Values, Status>) => FormikState<Values, Status>),
    cb?: () => void
  ): void;
}

/**
 * Formik form event handlers
 */
export interface FormikHandlers<Values extends FormikValues> {
  /** Form submit handler */
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  /** Reset form event handler  */
  handleReset: <T extends Element=Element, U extends Event = Event>(e?: React.SyntheticEvent<T, U>) => void;
  /** Classic React blur handler, keyed by input name */
  handleBlur<T extends Element>(e: React.FocusEvent<T>): void;
  /** Preact-like linkState. Will return a handleBlur function. */
  handleBlur<T extends Event = Event>(
    fieldOrEvent: T | keyof Values
  ): typeof fieldOrEvent extends keyof Values ? (e: T) => void : void;
  /** Classic React change handler, keyed by input name */
  // handleChange<T extends Element>(e: React.ChangeEvent<T>): void;
  /** Preact-like linkState. Will return a handleChange function.  */
  handleChange<T extends React.ChangeEvent = React.ChangeEvent>(
    fieldOrEvent: T | keyof Values
  ): typeof fieldOrEvent extends keyof Values
    ? (e: T | keyof Values) => void
    : void;
  getFieldProps<Value extends keyof Values = keyof Values>(props: any): FieldInputProps<Value>;
  getFieldMeta<Value extends keyof Values = keyof Values>(name: Value): FieldMetaProps<Value>;
  getFieldHelpers<Value extends keyof Values = keyof Values>(name: Value): FieldHelperProps<Value>;
}

/**
 * Base formik configuration/props shared between the HoC and Component.
 */
export interface FormikSharedConfig<Values extends FormikValues, Status> {
  /** Tells Formik to validate the form on each input's onChange event */
  validateOnChange?: boolean;
  /** Tells Formik to validate the form on each input's onBlur event */
  validateOnBlur?: boolean;
  /** Tells Formik to validate upon mount */
  validateOnMount?: boolean;
  /** Tell Formik if initial form values are valid or not on first render */
  isInitialValid?: boolean | ((props: FormikConfig<Values, Status>) => boolean);
  /** Should Formik reset the form when new initialValues change */
  enableReinitialize?: boolean;
}

/**
 * <Formik /> props
 */
export interface FormikConfig<Values extends FormikValues, Status> extends FormikSharedConfig<Values, Status> {
  /**
   * Form component to render
   */
  component?: React.ComponentType<FormikProps<Values, Status>> | React.ReactNode;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   * @deprecated
   */
  render?: (props: FormikProps<Values, Status>) => React.ReactNode;

  /**
   * React children or child render callback
   */
  children?:
    | ((props: FormikProps<Values, Status>) => React.ReactNode)
    | React.ReactNode;

  /**
   * Initial values of the form
   */
  initialValues: Values;

  /**
   * Initial status
   */
  initialStatus?: Status;

  /** Initial object map of field names to specific error for that field */
  initialErrors?: FormikErrors<Values>;

  /** Initial object map of field names to whether the field has been touched */
  initialTouched?: FormikTouched<Values>;

  /**
   * Reset handler
   */
  onReset?: (values: Values, formikHelpers: FormikHelpers<Values, Status>) => void;

  /**
   * Submission handler
   */
  onSubmit: (
    values: Values,
    formikHelpers: FormikHelpers<Values, Status>
  ) => void | Promise<any>;
  /**
   * A Yup Schema or a function that returns a Yup schema
   */
  validationSchema?: any | (() => any);

  /**
   * Validation function. Must return an error object or promise that
   * throws an error object where that object keys map to corresponding value.
   */
  validate?: (values: Values) => void | object | Promise<FormikErrors<Values>>;
}

/**
 * State, handlers, and helpers made available to form component or render prop
 * of <Formik/>.
 */
export type FormikProps<Values extends FormikValues, Status> = FormikSharedConfig<Values, Status> &
  FormikState<Values, Status> &
  FormikHelpers<Values, Status> &
  FormikHandlers<Values> &
  FormikComputedProps<Values, Status> &
  FormikRegistration<Values> & { submitForm: () => Promise<unknown> };

/** Internal Formik registration methods that get passed down as props */
export interface FormikRegistration<Values extends FormikValues> {
  registerField(name: keyof Values, fns: { validate?: FieldValidator }): void;
  unregisterField(name: keyof Values): void;
}

/**
 * State, handlers, and helpers made available to Formik's primitive components through context.
 */
export type FormikContextType<Values extends FormikValues, Status> = FormikProps<Values, Status> &
  Pick<FormikConfig<Values, Status>, 'validate' | 'validationSchema'>;

export interface SharedRenderProps<T> {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?: string | React.ComponentType<T | void>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   */
  render?: (props: T) => React.ReactNode;

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?: (props: T) => React.ReactNode;
}

export type GenericFieldHTMLAttributes =
  | JSX.IntrinsicElements['input']
  | JSX.IntrinsicElements['select']
  | JSX.IntrinsicElements['textarea'];

/** Field metadata */
export interface FieldMetaProps<Value> {
  /** Value of the field */
  value: Value;
  /** Error message of the field */
  error?: string;
  /** Has the field been visited? */
  touched: boolean;
  /** Initial value of the field */
  initialValue?: Value;
  /** Initial touched state of the field */
  initialTouched: boolean;
  /** Initial error message of the field */
  initialError?: string;
}

/** Imperative handles to change a field's value, error and touched */
export interface FieldHelperProps<Value> {
  /** Set the field's value */
  setValue(value: Value): void;
  /** Set the field's touched value */
  setTouched(value: boolean): void;
  /** Set the field's error value */
  setError(value: Value): void;
}

/** Field input value, name, and event handlers */
export interface FieldInputProps<Value, T extends string> {
  /** Value of the field */
  value: Value;
  /** Name of the field */
  name: T;
  /** Multiple select? */
  multiple?: boolean;
  /** Is the field checked? */
  checked?: boolean;
  /** Change event handler */
  onChange: FormikHandlers<Record<T, Value>>['handleChange'];
  /** Blur event handler */
  onBlur: FormikHandlers<Record<T, Value>>['handleBlur'];
}

export type FieldValidator = (
  value: any
) => string | void | Promise<string | void>;
