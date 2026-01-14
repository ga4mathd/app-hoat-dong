-- Prevent all updates on user_progress (progress should be immutable)
CREATE POLICY "User progress is immutable" 
ON public.user_progress 
FOR UPDATE 
USING (false);

-- Prevent all deletes on user_progress (maintain audit trail)
CREATE POLICY "User progress cannot be deleted" 
ON public.user_progress 
FOR DELETE 
USING (false);