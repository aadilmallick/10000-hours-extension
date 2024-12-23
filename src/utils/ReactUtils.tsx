import { createRoot } from "react-dom/client";
import React, { useEffect, useMemo, useState } from "react";
import PermissionsModel from "../chrome-api/permissions";
import { ChromeStorage } from "../chrome-api/storage";
import { CSSVariablesManager } from "./Dom";
import WebComponent from "./web-components/WebComponent";

export function injectRoot(app: React.ReactNode, id?: string) {
  const root = document.createElement("div");
  root.id = id || "crx-root";
  document.body.append(root);

  createRoot(root).render(<React.StrictMode>{app}</React.StrictMode>);
}

export function useObjectState<T extends Record<string, any>>(initialState: T) {
  const [state, setState] = React.useState(initialState);

  const setPartialState = React.useCallback((newState: Partial<T>) => {
    setState((prevState) => ({ ...prevState, ...newState }));
  }, []);

  const getValue = React.useCallback(function (key: keyof T) {
    return state[key];
  }, []);

  const setValue = React.useCallback(function (
    key: keyof T,
    value: T[keyof T]
  ) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  },
  []);

  return { state, setPartialState, getValue, setValue };
}

export function useGetCurrentTab() {
  const [tab, setTab] = React.useState<chrome.tabs.Tab | null>(null);

  React.useEffect(() => {
    async function getCurrentTab() {
      const [currentTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      setTab(currentTab);
    }

    getCurrentTab();
  }, []);

  return { tab };
}

export function useGetOptionalPermissions(
  optionalPermissions: PermissionsModel
) {
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    async function checkPerms() {
      const isGranted = await optionalPermissions.permissionIsGranted();
      setPermissionsGranted(isGranted);
    }

    checkPerms();
  }, []);

  const onCheckedChange = async (checked: boolean) => {
    setPermissionsGranted(checked);
    if (checked) {
      const granted = await optionalPermissions.request();
      if (!granted) setPermissionsGranted(false);
    }
    if (!checked) {
      const permissionsWereGranted =
        await optionalPermissions.permissionIsGranted();
      if (permissionsWereGranted) await optionalPermissions.remove();
    }
  };

  return { permissionsGranted, setPermissionsGranted, onCheckedChange };
}

export function useChromeStorage<
  T extends Record<string, any>,
  K extends keyof T
>(storage: ChromeStorage<T>, key: K) {
  const [value, setValue] = React.useState<T[K] | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function getValue() {
      setLoading(true);
      const data = await storage.get(key);
      setValue(data);
      setLoading(false);
    }

    getValue();
  }, []);

  React.useEffect(() => {
    const listener = storage.onChanged((change, key) => {
      console.log(change, key);
      setValue(change.newValue);
    });

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  async function setValueAndStore(newValue: T[K]) {
    setLoading(true);
    await storage.set(key, newValue);
    setValue(newValue);
    setLoading(false);
  }

  return { data: value, loading, setValueAndStore };
}

export function useWebComponentRef<T extends WebComponent>() {
  const ref = React.useRef<T>(null);

  function refActive() {
    return ref.current !== null;
  }

  return { ref, refActive };
}

export function useCssVariables<
  T extends HTMLElement = HTMLElement,
  V extends Record<string, string> = Record<string, string>
>(variables: V) {
  const ref = React.useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      const manager = new CSSVariablesManager<V>(ref.current);
      for (const [key, value] of Object.entries(variables)) {
        manager.set(key, value as (typeof variables)[keyof typeof variables]);
      }
    }
  }, [ref, variables]);

  return { ref };
}
