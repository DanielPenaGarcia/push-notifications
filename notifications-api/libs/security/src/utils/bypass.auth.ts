import { ExecutionContext, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

/** Bypass controller action key */
export const BYPASS_KEY = "bypass";

/** 
 * Set a bypass auth key metadata to controllers actions that 
 * doesn't need to evaluate with any auth mechanism
 */
export const BypassAuth = () => SetMetadata(BYPASS_KEY, true);

/**
 * Evaluates if a controller action should apply its guards checking
 * if the action has the BYPASS_KEY or not
 * @param context execution context
 * @param reflector reflector information
 * @returns true if the auth checking should be bypassing, otherwise false
 */
export const shouldBypassAuth = (
    context: ExecutionContext,
    reflector: Reflector
): boolean => {
    return reflector.get(BYPASS_KEY, context.getHandler());
};