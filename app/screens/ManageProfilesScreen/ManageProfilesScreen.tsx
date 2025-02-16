import React, { useMemo, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Button } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppDispatch, useDynamicStyles } from '../../hooks';
import { TextInput } from 'react-native-paper';

import { ConfirmModal, NavHeader, ProfileItem } from '../../components';
import { useSelectorFactory } from '../../hooks/useSelectorFactory';
import { makeSelectProfilesWithCredentials } from '../../store/selectorFactories';
import { createProfile } from '../../store/slices/profile';

import { ManageProfilesScreenProps } from './ManageProfilesScreen.d';
import dynamicStyleSheet from './ManageProfilesScreen.styles';

export default function ManageProfilesScreen({ navigation }: ManageProfilesScreenProps): JSX.Element {
  const { styles, theme, mixins } = useDynamicStyles(dynamicStyleSheet);
  const [profileName, setProfileName] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false); 
  const dispatch = useAppDispatch();

  const rawProfileRecords = useSelectorFactory(makeSelectProfilesWithCredentials);
  const flatListData = useMemo(() => [...rawProfileRecords].reverse(), [rawProfileRecords]);

  async function onPressCreate() {
    if (profileName !== '' ) {
      await dispatch(createProfile({ profileName }));
      setModalIsOpen(false);
      setProfileName('');
    }
  }

  async function onPressAddExisting() {
    navigation.navigate('AddExistingProfileScreen');
  }

  const ListHeader = (
    <View>
      <Button
        title="Create New Profile"
        buttonStyle={mixins.buttonIconCompact}
        containerStyle={mixins.buttonContainerVertical}
        titleStyle={mixins.buttonIconTitle}
        iconRight
        onPress={() => setModalIsOpen(true)}
        icon={
          <MaterialIcons
            name="add-circle"
            size={theme.iconSize}
            color={theme.color.iconInactive}
          />
        }
      />
      <Button
        title="Add Existing Profile"
        buttonStyle={mixins.buttonIconCompact}
        containerStyle={mixins.buttonContainerVertical}
        titleStyle={mixins.buttonIconTitle}
        iconRight
        onPress={onPressAddExisting}
        icon={
          <MaterialIcons
            name="add-circle"
            size={theme.iconSize}
            color={theme.color.iconInactive}
          />
        }
      />
    </View>
  );

  return (
    <>
      <NavHeader title="Manage Profiles" goBack={navigation.goBack} />
      <ConfirmModal
        open={modalIsOpen}
        onRequestClose={() => setProfileName('')}
        onCancel={() => setModalIsOpen(false)}
        onConfirm={onPressCreate}
        cancelOnBackgroundPress
        title="New Profile"
        cancelText="Cancel"
        confirmText="Create Profile"
      >
        <TextInput
          value={profileName}
          onChangeText={setProfileName}
          style={styles.input}
          outlineColor={theme.color.textPrimary}
          selectionColor={theme.color.textPrimary}
          theme={{
            colors: {
              placeholder: profileName ? theme.color.textPrimary : theme.color.inputInactive,
              text: theme.color.textPrimary,
              primary: theme.color.brightAccent,
            },
          }}
          label="Profile Name"
          mode="outlined"
          keyboardAppearance={theme.keyboardAppearance}
        />
      </ConfirmModal>
      <FlatList
        inverted
        ListFooterComponent={ListHeader}
        contentContainerStyle={styles.container}
        data={flatListData}
        renderItem={({ item }) => 
          <ProfileItem rawProfileRecord={item} />
        }
      />
    </>
  );
}
