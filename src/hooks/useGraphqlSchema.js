import { useState } from 'react';
import { requestApi } from '@/api/request.api';
import { useAppStore } from '@/store/useAppStore';
import { useModal } from '@/components/providers/ModalProvider';

const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      types {
        name
        kind
        description
        fields {
          name
          type { name kind ofType { name kind } }
        }
      }
    }
  }
`;

export function useGraphqlSchema(activeId) {
  const store = useAppStore();
  const { showAlert } = useModal();
  const [schema, setSchema] = useState(null);
  const [isFetchingSchema, setIsFetchingSchema] = useState(false);

  const formatListToObject = (list) => {
    if (!Array.isArray(list)) return {};
    return list.reduce((acc, item) => { 
      if (item.key && item.active !== false) acc[item.key] = item.value; 
      return acc; 
    }, {});
  };

  const handleFetchSchema = async () => {
    const activeReqState = store.requestStates[activeId];
    if (!activeReqState?.config?.url) {
      showAlert("Please enter a valid GraphQL URL first.");
      return;
    }
      
    setIsFetchingSchema(true);
    try {
      const headers = formatListToObject(activeReqState.config?.headers || []);
      const result = await requestApi.executeAdHocRequest({
        workspaceId: store.activeWorkspaceId,
        protocol: 'graphql',
        config: {
          method: 'POST',
          url: activeReqState.config.url,
          headers: headers,
          body: {
            type: 'graphql',
            graphql: { query: INTROSPECTION_QUERY, variables: {} }
          }
        },
        environmentId: null
      });

      if (result.success && result.data?.data?.__schema) {
        setSchema(result.data.data);
      } else {
        throw new Error("Invalid GraphQL endpoint or schema introspection disabled.");
      }
    } catch (e) {
      showAlert(`Failed to fetch schema: ${e.message}`);
    } finally {
      setIsFetchingSchema(false);
    }
  };

  return { schema, isFetchingSchema, handleFetchSchema };
}