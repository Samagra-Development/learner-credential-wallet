import React, { useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { TextInput } from 'react-native-paper';

import dynamicStyleSheet from './AddScreen.styles';
import { AddScreenProps } from './AddScreen.d';
import { stageCredentials } from '../../store/slices/credentialFoyer';
import { NavHeader } from '../../components';
import { credentialRequestParamsFromQrText, credentialsFrom, isDeepLink } from '../../lib/decode';
import { PresentationError } from '../../types/presentation';
import { errorMessageMatches, HumanReadableError } from '../../lib/error';
import { navigationRef } from '../../navigation';
import { CredentialRequestParams } from '../../lib/request';
import { pickAndReadFile } from '../../lib/import';
import { displayGlobalError } from '../../store/slices/wallet';
import { CANCEL_PICKER_MESSAGES } from '../../lib/constants';
import { useAppDispatch, useDynamicStyles } from '../../hooks';
import { ScrollView } from 'react-native-gesture-handler';
import { cleanCopy } from '../../lib/encode';

export default function AddScreen({ navigation }: AddScreenProps): JSX.Element {
  const { styles, theme, mixins } = useDynamicStyles(dynamicStyleSheet);
  const [inputValue, setInputValue] = useState('');
  const dispatch = useAppDispatch();
  const inputIsValid = inputValue !== '';

  function onPressQRScreen() {
    navigation.navigate('CredentialQRScreen', {
      instructionText: 'Scan a QR code from your issuer to request your credentials.',
      onReadQRCode,
    });
  }

  function goToChooseProfile(params?: CredentialRequestParams) {
    if (navigationRef.isReady()) {
      if (navigationRef.isReady()) {
        navigationRef.navigate('AcceptCredentialsNavigation', { 
          screen: 'ChooseProfileScreen',
          params,
        });
      }
    }
  }

  async function addCredentialsFrom(text: string) {
    if (isDeepLink(text)) {
      const params = credentialRequestParamsFromQrText(text);
      goToChooseProfile(cleanCopy(params));
    } else {
      const credentials = await credentialsFrom(text);
      dispatch(stageCredentials(credentials));
      goToChooseProfile();
    }
  }

  async function addFromFile() {
    try {
      const text = await pickAndReadFile();
      await addCredentialsFrom(text);
    } catch (err) {
      if (errorMessageMatches(err, CANCEL_PICKER_MESSAGES)) return;

      console.error(err);
      await dispatch(displayGlobalError({ 
        title: 'Unable to Add Credentials',
        message: 'Ensure the file contains one or more credentials, and is a supported file type.' 
      }));
    }
  }

  async function addFromUrl() {
    try {
      await addCredentialsFrom(inputValue);
    } catch (err) {
      console.error(err);
      await dispatch(displayGlobalError({ 
        title: 'Unable to Add Credentials',
        message: 'Ensure the URL references a file that contains one or more credentials.' 
      }));
    }
  }

  async function onReadQRCode(text: string) {
    AccessibilityInfo.announceForAccessibility('QR Code Scanned');

    try {
      await addCredentialsFrom(text);
    } catch (err) {
      console.warn(err);

      if (errorMessageMatches(err, Object.values(PresentationError))) {
        throw new HumanReadableError(err.message);
      } else {
        throw new HumanReadableError('An error was encountered when parsing this QR code.');
      }
    }
  }

  return (
    <>
      <NavHeader title="Add Credential" />
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View style={styles.container}>
          <Text style={styles.paragraph}>
          To add credentials, follow an approved link from an issuer (most often a
          University) or use the options below.
          </Text>
          <Button
            title="Scan QR code"
            buttonStyle={mixins.buttonIconCompact}
            containerStyle={[mixins.buttonIconContainer, mixins.noFlex]}
            titleStyle={mixins.buttonIconTitle}
            iconRight
            onPress={onPressQRScreen}
            icon={
              <MaterialIcons
                name="qr-code-scanner"
                size={theme.iconSize}
                color={theme.color.iconInactive}
              />
            }
          />
          <Button
            title="Add from file"
            buttonStyle={mixins.buttonIconCompact}
            containerStyle={[mixins.buttonIconContainer, mixins.noFlex]}
            titleStyle={mixins.buttonIconTitle}
            iconRight
            onPress={addFromFile}
            icon={
              <MaterialCommunityIcons
                name="file-upload"
                size={theme.iconSize}
                color={theme.color.iconInactive}
              />
            }
          />
          <View style={styles.sectionContainer}>
            <View style={styles.actionInputContainer}>
              <TextInput
                multiline
                value={inputValue}
                onChangeText={setInputValue}
                style={styles.input}
                outlineColor={theme.color.iconInactive}
                selectionColor={theme.color.textPrimary}
                theme={{
                  colors: {
                    placeholder: theme.color.textSecondary,
                    text: theme.color.textPrimary,
                    primary: theme.color.brightAccent,
                  },
                }}
                label="Paste JSON or URL"
                mode="outlined"
                keyboardAppearance={theme.keyboardAppearance}
              />
              <Button
                title="Add"
                buttonStyle={[mixins.buttonCompact, mixins.buttonPrimary, styles.actionButton]}
                containerStyle={[mixins.buttonContainer, styles.actionButtonContainer]}
                titleStyle={[mixins.buttonTitle]}
                onPress={addFromUrl}
                disabled={!inputIsValid}
                disabledStyle={styles.actionButtonInactive}
                disabledTitleStyle={styles.actionButtonInactiveTitle}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
