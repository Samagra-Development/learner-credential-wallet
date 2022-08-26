import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableWithoutFeedback, AccessibilityInfo } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';

import { mixins } from '../../styles';
import { MenuItem, NavHeader, ConfirmModal, AccessibleView, VerificationCard, CredentialCard } from '../../components';
import { CredentialScreenProps, navigationRef } from '../../navigation';
import { credentialRenderInfo } from '../../components/CredentialCard/CredentialCard';

import styles from './CredentialScreen.styles';
import { deleteCredential } from '../../store/slices/credential';
import { makeSelectProfileFromCredential } from '../../store/selectorFactories';
import { useSelectorFactory } from '../../hooks/useSelectorFactory';

export default function CredentialScreen({ navigation, route }: CredentialScreenProps): JSX.Element {
  const dispatch = useDispatch();
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const { rawCredentialRecord, noShishKabob = false } = route.params;
  const { credential } = rawCredentialRecord;
  const { title } = credentialRenderInfo(credential);

  const rawProfileRecord = useSelectorFactory(makeSelectProfileFromCredential, { rawCredentialRecord });
  const { profileName } = rawProfileRecord;

  function onPressShare() {
    if (navigationRef.isReady()) {
      navigationRef.navigate('HomeNavigation', {
        screen: 'CredentialNavigation',
        params: {
          screen: 'ShareCredentialScreen',
          params: { rawCredentialRecord },
        } 
      });
    }
  }

  function onPressDebug() {
    setMenuIsOpen(false);
    if (navigationRef.isReady()) {
      navigationRef.navigate('DebugScreen', { rawCredentialRecord, rawProfileRecord });
    }
  }

  function onPressDelete() {
    setMenuIsOpen(false);
    setModalIsOpen(true);
  }

  async function onConfirmDelete() {
    dispatch(deleteCredential(rawCredentialRecord));
    AccessibilityInfo.announceForAccessibility('Credential Deleted');
    navigation.goBack();
  }

  function HeaderRightComponent(): JSX.Element | null {
    if (noShishKabob) {
      return null;
    }

    return (
      <AccessibleView
        label="More options"
        accessibilityRole="button"
        accessibilityState={{ expanded: menuIsOpen }}
        onPress={() => setMenuIsOpen(!menuIsOpen)}
      >
        <MaterialIcons
          name="more-vert"
          style={mixins.headerIcon}
        />
      </AccessibleView>
    );
  }

  return (
    <>
      <NavHeader
        title="Credential Preview"
        goBack={() => navigation.goBack()}
        rightComponent={<HeaderRightComponent />}
      />
      <ConfirmModal
        open={modalIsOpen}
        onRequestClose={() => setModalIsOpen(!modalIsOpen)}
        onConfirm={onConfirmDelete}
        title="Delete Credential"
        confirmText="Delete"
        accessibilityFocusContent
      >
        <Text style={mixins.modalBodyText}>
          Are you sure you want to remove {title} from your wallet?
        </Text>
      </ConfirmModal>
      <View style={styles.outerContainer}>
        {menuIsOpen ? (
          <View style={styles.menuContainer} accessibilityViewIsModal={true}>
            <MenuItem icon="share" title="Share" onPress={onPressShare} />
            <MenuItem icon="info-outline" title="View Source" onPress={onPressDebug} />
            <MenuItem icon="delete" title="Delete" onPress={onPressDelete} />
          </View>
        ) : null}
        <ScrollView
          onScrollEndDrag={() => setMenuIsOpen(false)}
          style={styles.scrollContainer}
          accessible={false}
          importantForAccessibility={menuIsOpen ? 'no-hide-descendants' : 'no'}
        >
          <TouchableWithoutFeedback
            onPress={() => setMenuIsOpen(false)}
            accessible={false}
            importantForAccessibility="no"
          >
            <View style={styles.container}>
              <CredentialCard rawCredentialRecord={rawCredentialRecord} />
              <VerificationCard credential={credential} isButton showDetails={false}/>
              <View style={styles.profileContainer}>
                <Text style={mixins.paragraphText}>
                  <Text style={styles.textBold}>Profile:</Text> {profileName}
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </View>
    </>
  );
}
