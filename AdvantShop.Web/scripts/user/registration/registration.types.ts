export interface ICustomerField {
    Id: number;
    Name: string;
    FieldType: number;
    SortOrder: number;
    Required: boolean;
    Enabled: boolean;
    ShowInRegistration: boolean;
    ShowInCheckout: boolean;
    DisableCustomerEditing: boolean;
    ShowInUserEditing: boolean;
    CustomerType: number;
    FieldAssignment: number;
    LetterKey: string;
}

export interface ICustomerFieldWithValue extends ICustomerField {
    Value: string | null;
}

export interface IInitRegistration {
    Settings: IRegistrationSettings;
    Registration: IRegistration;
}

export interface IRegistration {
    FirstName: string | null;
    LastName: string | null;
    Phone: string | null;
    BirthDay: string | null;
    Patronymic: string | null;
    Email: string | null;
    Password: string | null;
    PasswordConfirm: string | null;
    WantBonusCard: boolean;
    CustomerFields: ICustomerFieldWithValue[] | null;
    NewsSubscription: boolean;
    Agree: boolean;
    UserAgreementForPromotionalNewsletter: boolean;
    CustomerType: string;
    Captcha: string | null;
}

export interface IRegistrationSettings {
    AllCustomerTypes: boolean;
    CustomerTypeByDefault: string;
    SuggestionsModule: ISuggestions | null;
    CustomerFirstNameField: string | null;
    IsShowLastName: boolean;
    IsRequiredLastName: boolean;
    IsShowPatronymic: boolean;
    IsRequiredPatronymic: boolean;
    IsShowEmail: boolean;
    IsRequiredEmail: boolean;
    AuthByCodeActive: boolean;
    CustomerPhoneField: string | null;
    IsShowPhone: boolean;
    IsRequiredPhone: boolean;
    EnablePhoneMask: boolean;
    BirthDayFieldName: string | null;
    IsShowBirthDay: boolean;
    IsRequiredBirthDay: boolean;
    IsBonusSystemActive: boolean;
    BonusesForNewCard: string | null;
    IsDemo: boolean;
    IsShowUserAgreementText: boolean;
    UserAgreementText: string | null;
    CustomerTypes: ISelectListItem[] | null;
    EnableCaptchaInRegistration: boolean;
    ShowUserAgreementForPromotionalNewsletter: boolean;
    UserAgreementForPromotionalNewsletter: string | null;
    PartnersActive: boolean;
    UseEmailConfirmation: boolean;
    UsePhoneConfirmation: boolean;
}

export interface ISelectListItem {
    Text: string;
    Value: string;
}

export interface ISuggestions {
    SuggestFullNameUrl: string | null;
}

export type MethodType = 'email' | 'code' | 'full';

